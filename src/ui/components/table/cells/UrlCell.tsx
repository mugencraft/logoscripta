export const UrlCell = ({ url, label }: { url: string; label?: string }) => {
	return (
		// <div className="w-full">
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			className="text-sm text-muted-foreground hover:text-primary hover:underline"
		>
			<span className="line-clamp-1">{label || url}</span>
		</a>
		// </div>
	);
};
