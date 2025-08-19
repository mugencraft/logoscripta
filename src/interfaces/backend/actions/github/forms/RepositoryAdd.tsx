import { useId, useState } from "react";

import type { RepositoryList } from "@/domain/models/github/repository-list";
import { type ParsedRepo, parseGithubRepos } from "@/shared/github/utils";

import type { BaseActionProps } from "@/ui/components/actions/types";
import { Button } from "@/ui/components/core/button";
import { Checkbox } from "@/ui/components/core/checkbox";
import { Label } from "@/ui/components/core/label";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import { Textarea } from "@/ui/components/core/textarea";

import { useRepositoryToggleActions } from "../useRepositoryToggleActions";

export function RepositoryAdd({
  data,
  onSuccess,
  onCancel,
}: BaseActionProps<RepositoryList>) {
  const [parsedRepos, setParsedRepos] = useState<ParsedRepo[]>([]);
  const [saveToDatabase, setSaveToDatabase] = useState(true);
  const { handleAddToList, handleSyncRepositoryData, handleSaveRepository } =
    useRepositoryToggleActions({
      onSuccess,
    });

  const handleSubmit = async () => {
    const fullNames = parsedRepos
      .filter((repo) => repo.selected)
      .map((repo) => repo.fullName);

    if (fullNames.length > 0) {
      if (data) {
        // Adding to specific list
        if (saveToDatabase) {
          // Sync repositories first, then add to list
          await handleSyncRepositoryData(fullNames);
        }
        await handleAddToList(data.id, fullNames);
      } else {
        // Just save repositories, no list context
        await handleSaveRepository(fullNames);
      }
    }
  };

  const saveId = useId();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="input" className="text-sm font-medium">
          Enter repository names or URLs (one per line)
        </Label>
        <Textarea
          name="input"
          onChange={(e) => setParsedRepos(parseGithubRepos(e.target.value))}
          placeholder="owner/repo&#10;https://github.com/owner/repo&#10;..."
          className="h-32"
        />
      </div>

      {parsedRepos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={saveId}
              checked={saveToDatabase}
              onCheckedChange={(checked) => setSaveToDatabase(!!checked)}
            />
            <Label htmlFor={saveId} className="text-sm font-medium">
              Save repositories to database (fetches data from GitHub)
            </Label>
          </div>

          <Label className="text-sm font-medium">Parsed Repositories</Label>
          <ScrollArea className="h-48 border rounded-md p-2">
            <div className="space-y-2">
              {parsedRepos.map((repo, index) => (
                <div
                  key={repo.fullName}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent/5"
                >
                  <Checkbox
                    checked={repo.selected}
                    onCheckedChange={(checked) => {
                      setParsedRepos((repos) =>
                        repos.map((r, i) =>
                          i === index ? { ...r, selected: !!checked } : r,
                        ),
                      );
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-sm">{repo.fullName}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="secondary"
          onClick={handleSubmit}
          disabled={!parsedRepos.some((repo) => repo.selected)}
        >
          Add Selected Repositories
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
