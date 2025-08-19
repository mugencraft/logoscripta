import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface IconCellProps {
  name?: IconName;
  size?: number;
}

export const IconCell = ({ name, size = 24 }: IconCellProps) => {
  return name && <DynamicIcon name={name} size={size} />;
};
