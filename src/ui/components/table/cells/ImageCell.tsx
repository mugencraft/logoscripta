import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/core/tooltip";

interface ImageCellProps {
  src?: string;
  alt: string;
}

export const ImageCell = ({ src, alt }: ImageCellProps) => {
  if (!src) return <div>No preview</div>;

  return (
    <Tooltip>
      <TooltipTrigger>
        <img
          src={src}
          alt={alt}
          className="w-16 h-9 object-cover rounded border"
        />
      </TooltipTrigger>
      <TooltipContent side="right">
        <img
          src={src}
          alt={alt}
          className="max-w-[320px] max-h-[240px] object-contain rounded"
        />
      </TooltipContent>
    </Tooltip>
  );
};
