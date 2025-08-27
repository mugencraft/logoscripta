import { UrlCell } from "@/ui/components/table/cells/UrlCell";

interface GithubCellProps {
  fullName: string;
}

export const GithubCell = ({ fullName }: GithubCellProps) => {
  return <UrlCell url={`https://github.com/${fullName}`} label={fullName} />;
};
