export function ToolbarItem({ key, label, icon, action }) {
  return (
    <div
      key={key}
      className="kef-wrap-tb-item"
      onMouseDown={(e) => action(e, key)}
      title={label}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
        alt={label}
      />
    </div>
  )
}
