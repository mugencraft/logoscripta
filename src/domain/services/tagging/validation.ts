import type { Tag, TagRelationship } from "@/domain/models/tagging/tag";

import type { TagSystemQueriesPort } from "../../ports/tagging/queries";

type ValidationIssue = {
  type:
    | "conflict"
    | "missing_requirement"
    | "implied_tag"
    | "category_rule_violation";
  severity: "blocking" | "warning" | "info";
  description: string;
  affectedTags: number[];
  autoResolution?: { action: "add" | "remove"; tagIds: number[] };
};

type TagSelectionResult = {
  isValid: boolean;
  resolvedTagIds: number[];
  issues: ValidationIssue[];
};

type SystemIntegrityIssue = {
  type: "circular_dependency" | "orphaned_reference" | "contradictory_rules";
  severity: "blocking" | "warning";
  description: string;
  affectedItems: number[];
};

type SystemIntegrityResult = {
  isValid: boolean;
  issues: SystemIntegrityIssue[];
};

export class TagValidationService {
  constructor(private tagQueries: TagSystemQueriesPort) {}

  async validateTagSelection(
    selectedTagIds: number[],
    systemId: number,
    options: { autoResolve: boolean } = { autoResolve: true },
  ): Promise<TagSelectionResult> {
    // Filter tags by system upfront
    const validTags = await this._getValidSystemTags(selectedTagIds, systemId);
    if (validTags.length === 0) {
      return { isValid: true, resolvedTagIds: [], issues: [] };
    }

    const currentTagIds = new Set(validTags.map((t) => t.id));
    const issues: ValidationIssue[] = [];

    // Process each tag's relationships
    for (const tag of validTags) {
      const tagIssues = await this._processTagRelationships(
        tag,
        currentTagIds,
        options.autoResolve,
      );
      issues.push(...tagIssues);
    }

    // Validate category rules after relationship processing
    const categoryIssues = await this._validateCategoryRules(
      Array.from(currentTagIds),
      systemId,
    );
    issues.push(...categoryIssues);

    return {
      isValid: !issues.some((issue) => issue.severity === "blocking"),
      resolvedTagIds: Array.from(currentTagIds),
      issues,
    };
  }

  private async _getValidSystemTags(tagIds: number[], systemId: number) {
    const tags = [];
    for (const tagId of tagIds) {
      const tag = await this.tagQueries.findTagById(tagId);
      if (tag && tag.systemId === systemId) {
        tags.push(tag);
      }
    }
    return tags;
  }

  private async _processTagRelationships(
    tag: Tag,
    currentTagIds: Set<number>,
    autoResolve: boolean,
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const relationships = await this.tagQueries.getTagRelationships(
      tag.id,
      "sourceTagId",
    );

    // Group relationships by type for cleaner processing
    const grouped = this._groupRelationshipsByType(relationships);

    // Process implications
    for (const impliedId of grouped.implies) {
      if (!currentTagIds.has(impliedId)) {
        currentTagIds.add(impliedId);
        issues.push({
          type: "implied_tag",
          severity: "info",
          description: `Tag "${tag.name}" automatically adds implied tags`,
          affectedTags: [tag.id, impliedId],
          autoResolution: { action: "add", tagIds: [impliedId] },
        });
      }
    }

    // Process conflicts
    const activeConflicts = grouped.conflicts.filter((id) =>
      currentTagIds.has(id),
    );
    if (activeConflicts.length > 0) {
      issues.push({
        type: "conflict",
        severity: "blocking",
        description: `Tag "${tag.name}" conflicts with selected tags`,
        affectedTags: [tag.id, ...activeConflicts],
        autoResolution: autoResolve
          ? { action: "remove", tagIds: activeConflicts }
          : undefined,
      });

      if (autoResolve) {
        for (const conflictId of activeConflicts) {
          currentTagIds.delete(conflictId);
        }
      }
    }

    // Process requirements
    const missingRequirements = grouped.requires.filter(
      (id) => !currentTagIds.has(id),
    );
    if (missingRequirements.length > 0) {
      issues.push({
        type: "missing_requirement",
        severity: "warning",
        description: `Tag "${tag.name}" requires additional tags`,
        affectedTags: [tag.id, ...missingRequirements],
        autoResolution: autoResolve
          ? { action: "add", tagIds: missingRequirements }
          : undefined,
      });

      if (autoResolve) {
        for (const reqId of missingRequirements) {
          currentTagIds.add(reqId);
        }
      }
    }

    return issues;
  }

  private _groupRelationshipsByType(relationships: TagRelationship[]) {
    const grouped = {
      implies: [] as number[],
      conflicts: [] as number[],
      requires: [] as number[],
    } as const;

    return relationships.reduce((acc, rel) => {
      const type = rel.relationshipType as keyof typeof grouped;
      if (acc[type]) {
        acc[type].push(rel.targetTagId);
      }
      return acc;
    }, grouped);
  }

  private async _validateCategoryRules(
    tagIds: number[],
    systemId: number,
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Get all categories for the system with their rules
    const categories = await this.tagQueries.getAllCategories(systemId);

    for (const category of categories) {
      const rules = category.metadata?.rules;
      if (!rules) continue;

      // Get tags in this category from current selection
      const categoryTags = [];
      for (const tagId of tagIds) {
        const hasAssociation = await this.tagQueries.hasTagCategoryAssociation(
          tagId,
          category.id,
        );
        if (hasAssociation) {
          categoryTags.push(tagId);
        }
      }

      // Check required rule
      if (rules.required && categoryTags.length === 0) {
        issues.push({
          type: "category_rule_violation",
          severity: "blocking",
          description: `Category "${category.name}" requires at least one tag`,
          affectedTags: [],
        });
      }

      // Check oneOfKind rule
      if (rules.oneOfKind && categoryTags.length > 1) {
        issues.push({
          type: "category_rule_violation",
          severity: "blocking",
          description: `Category "${category.name}" allows only one tag`,
          affectedTags: categoryTags,
          autoResolution: { action: "remove", tagIds: categoryTags.slice(1) },
        });
      }
    }

    return issues;
  }

  async validateSystemIntegrity(
    systemId: number,
  ): Promise<SystemIntegrityResult> {
    const issues: SystemIntegrityIssue[] = [];

    const [circularDeps, orphanedRefs] = await Promise.all([
      this._detectCircularDependencies(systemId),
      this._detectOrphanedReferences(systemId),
    ]);

    issues.push(...circularDeps, ...orphanedRefs);

    return {
      isValid: !issues.some((issue) => issue.severity === "blocking"),
      issues,
    };
  }

  private async _detectCircularDependencies(
    systemId: number,
  ): Promise<SystemIntegrityIssue[]> {
    const issues: SystemIntegrityIssue[] = [];
    const systemTags = await this.tagQueries.getTagsBySystem(systemId);
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    for (const tag of systemTags) {
      if (!visited.has(tag.id)) {
        const cycle = await this._findCycleFromTag(
          tag.id,
          visited,
          recursionStack,
          ["implies", "requires"],
        );
        if (cycle.length > 0) {
          issues.push({
            type: "circular_dependency",
            severity: "blocking",
            description: `Circular dependency detected in relationship chain`,
            affectedItems: cycle,
          });
        }
      }
    }

    return issues;
  }

  private async _findCycleFromTag(
    tagId: number,
    visited: Set<number>,
    recursionStack: Set<number>,
    relationshipTypes: string[],
  ): Promise<number[]> {
    visited.add(tagId);
    recursionStack.add(tagId);

    const relationships = await this.tagQueries.getTagRelationships(
      tagId,
      "sourceTagId",
    );

    for (const rel of relationships) {
      if (!relationshipTypes.includes(rel.relationshipType)) continue;

      const targetId = rel.targetTagId;

      if (recursionStack.has(targetId)) {
        return [tagId, targetId];
      }

      if (!visited.has(targetId)) {
        const cycle = await this._findCycleFromTag(
          targetId,
          visited,
          recursionStack,
          relationshipTypes,
        );
        if (cycle.length > 0) {
          return [tagId, ...cycle];
        }
      }
    }

    recursionStack.delete(tagId);
    return [];
  }

  private async _detectOrphanedReferences(
    systemId: number,
  ): Promise<SystemIntegrityIssue[]> {
    const issues: SystemIntegrityIssue[] = [];
    const systemTags = await this.tagQueries.getTagsBySystem(systemId);
    const systemTagIds = new Set(systemTags.map((t) => t.id));

    for (const tag of systemTags) {
      const relationships = await this.tagQueries.getTagRelationships(
        tag.id,
        "sourceTagId",
      );

      for (const rel of relationships) {
        if (!systemTagIds.has(rel.targetTagId)) {
          issues.push({
            type: "orphaned_reference",
            severity: "blocking",
            description: `Tag "${tag.name}" references non-existent target tag`,
            affectedItems: [tag.id, rel.targetTagId],
          });
        }
      }
    }

    return issues;
  }
}
