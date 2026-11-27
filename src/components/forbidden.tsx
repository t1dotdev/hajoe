export function Forbidden({
	title,
	message,
}: {
	title: string;
	message: string;
}) {
	return (
		<main className="grid min-h-svh place-items-center px-6 text-center">
			<div>
				<h1 className="text-xl font-bold">{title}</h1>
				<p className="mt-2 text-muted-foreground">{message}</p>
			</div>
		</main>
	);
}
