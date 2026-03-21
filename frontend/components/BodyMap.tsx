// OWNER: Member 2
// Body map using react-body-highlighter
// Props: organs: string[] — array of affected organ names from GUC
// Wire organFlags from GUC to SVG organ IDs
// Apply .organ-glow CSS class to highlighted organs (defined in globals.css)

interface BodyMapProps {
  organs: string[]
}

export default function BodyMap({ organs }: BodyMapProps) {
  // TODO Member 2: implement with react-body-highlighter
  return (
    <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
      BodyMap — Member 2 {organs.length > 0 && `(${organs.join(", ")})`}
    </div>
  )
}
