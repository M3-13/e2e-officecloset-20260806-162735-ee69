import { ALL_CATEGORIES } from '../api/types.ts'

interface CategoryFilterProps {
  active: string
  onChange: (category: string) => void
}

function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {ALL_CATEGORIES.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`px-4 py-1.5 rounded-pill text-[13px] font-medium border transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-accent text-bg font-semibold border-accent'
                : 'bg-bg-card text-fg-muted border-transparent hover:border-border-accent hover:text-fg'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
