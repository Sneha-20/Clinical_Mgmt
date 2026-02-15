export default function RoleSelection({ options, selected, onSelect, error }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Your Role</label>

      <div className="grid sm:grid-cols-2 gap-4">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selected === item.id
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50"
            }`}
          >
            <div className="font-medium text-sm">{item.label}</div>
            <div className="text-xs text-muted-foreground">
              {item.description}
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}