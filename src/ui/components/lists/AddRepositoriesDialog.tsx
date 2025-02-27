import { useListActions } from "@/interfaces/backend/hooks/useListActions";
import { parseGithubRepo } from "@/shared/github/utils";
import { Button } from "@/ui/components/core/button";
import { Checkbox } from "@/ui/components/core/checkbox";
import { Label } from "@/ui/components/core/label";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import { Textarea } from "@/ui/components/core/textarea";
import type { StepProps } from "@/ui/components/table/types";
import { useState } from "react";

interface AddRepositoriesDialogProps extends StepProps<string> {
	listId: number;
}

interface ParsedRepo {
	fullName: string;
	selected: boolean;
	error?: string;
}

export function AddRepositoriesDialog({
	listId,
	onSuccess,
	onCancel,
}: AddRepositoriesDialogProps) {
	const [input, setInput] = useState("");
	const [parsedRepos, setParsedRepos] = useState<ParsedRepo[]>([]);
	const [saveToDatabase, setSaveToDatabase] = useState(true);
	const { handleAddToList, handleSyncRepositoryData } = useListActions({
		onSuccess,
	});

	const parseRepositories = () => {
		const lines = input
			.split(/[\n,\s]+/) // Split by newlines, commas, or whitespace
			.filter((line) => line.trim()); // Remove empty lines

		const parsed = lines.map((line) => {
			try {
				const repo = parseGithubRepo(line);
				return {
					fullName: `${repo.owner}/${repo.repo}`,
					selected: true,
				};
			} catch (error) {
				return {
					fullName: line,
					selected: false,
					error:
						error instanceof Error
							? error.message
							: "Invalid repository format",
				};
			}
		});

		setParsedRepos(parsed);
	};

	const handleSubmit = async () => {
		const selectedRepos = parsedRepos
			.filter((repo) => repo.selected && !repo.error)
			.map((repo) => repo.fullName);

		if (selectedRepos.length > 0) {
			// First save repositories to the database if the option is selected
			if (saveToDatabase) {
				for (const fullName of selectedRepos) {
					await handleSyncRepositoryData({ fullNames: [fullName] });
				}
			}
			// Then add them to the list
			handleAddToList(listId, selectedRepos);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="input" className="text-sm font-medium">
					Enter repository names or URLs (one per line)
				</Label>
				<Textarea
					value={input}
					name="input"
					onChange={(e) => setInput(e.target.value)}
					placeholder="owner/repo&#10;https://github.com/owner/repo&#10;..."
					className="h-32"
				/>
			</div>

			<Button
				variant="secondary"
				onClick={parseRepositories}
				disabled={!input.trim()}
			>
				Parse Repositories
			</Button>

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
									className={`flex items-center gap-2 p-2 rounded ${
										repo.error ? "bg-destructive/10" : "hover:bg-accent/5"
									}`}
								>
									<Checkbox
										checked={repo.selected}
										disabled={!!repo.error}
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
										{repo.error && (
											<div className="text-xs text-destructive">
												{repo.error}
											</div>
										)}
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
					disabled={!parsedRepos.some((repo) => repo.selected && !repo.error)}
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
