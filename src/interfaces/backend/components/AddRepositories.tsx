import { parseGithubRepo } from "@/shared/github/utils";
import { Button } from "@/ui/components/core/button";
import { Checkbox } from "@/ui/components/core/checkbox";
import { Label } from "@/ui/components/core/label";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import { Textarea } from "@/ui/components/core/textarea";
import type { InteractionProps } from "@/ui/components/table/types";
import { useState } from "react";
import { useListActions } from "../hooks/useListActions";

interface AddRepositoriesProps extends InteractionProps<string> {
	listId: number;
}

interface ParsedRepo {
	fullName: string;
	selected: boolean;
}

export function AddRepositories({
	listId,
	onSuccess,
	onCancel,
}: AddRepositoriesProps) {
	const [parsedRepos, setParsedRepos] = useState<ParsedRepo[]>([]);
	const [saveToDatabase, setSaveToDatabase] = useState(true);
	const { handleAddToList, handleSyncRepositoryData } = useListActions({
		onSuccess,
	});

	const parseRepositories = (input: string) => {
		const lines = input
			.split(/[\n,\s]+/) // Split by newlines, commas, or whitespace
			.filter((line) => line.trim()); // Remove empty lines

		const parsed: ParsedRepo[] = [];
		for (const line of lines) {
			try {
				const repo = parseGithubRepo(line);
				parsed.push({
					fullName: `${repo.owner}/${repo.repo}`,
					selected: true,
				});
			} catch (error) {}
		}

		setParsedRepos(parsed);
	};

	const handleSubmit = async () => {
		const selectedRepos = parsedRepos
			.filter((repo) => repo.selected)
			.map((repo) => repo.fullName);

		if (selectedRepos.length > 0) {
			if (saveToDatabase) {
				for (const fullName of selectedRepos) {
					await handleSyncRepositoryData({ fullNames: [fullName] });
				}
			}
			await handleAddToList(listId, selectedRepos);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="input" className="text-sm font-medium">
					Enter repository names or URLs (one per line)
				</Label>
				<Textarea
					name="input"
					onChange={(e) => parseRepositories(e.target.value)}
					placeholder="owner/repo&#10;https://github.com/owner/repo&#10;..."
					className="h-32"
				/>
			</div>

			{parsedRepos.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Checkbox
							id="save-to-db"
							checked={saveToDatabase}
							onCheckedChange={(checked) => setSaveToDatabase(!!checked)}
						/>
						<Label htmlFor="save-to-db" className="text-sm font-medium">
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
