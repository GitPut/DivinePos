import React, { useState } from "react";
import { ingredientsState } from "store/appState";
import { Ingredient, RecipeItem } from "types";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface RecipeEditorProps {
  recipe: RecipeItem[];
  onRecipeChange: (recipe: RecipeItem[]) => void;
}

function RecipeEditor({ recipe, onRecipeChange }: RecipeEditorProps) {
  const ingredients = ingredientsState.use();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");

  const availableIngredients = ingredients.filter(
    (ing) => !recipe.some((r) => r.ingredientId === ing.id)
  );

  const filteredDropdown = availableIngredients.filter(
    (ing) =>
      !dropdownSearch ||
      ing.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const addIngredient = (ing: Ingredient) => {
    onRecipeChange([
      ...recipe,
      {
        ingredientId: ing.id,
        ingredientName: ing.name,
        quantity: 0,
        unit: ing.unit,
      },
    ]);
    setShowDropdown(false);
    setDropdownSearch("");
  };

  const removeIngredient = (ingredientId: string) => {
    onRecipeChange(recipe.filter((r) => r.ingredientId !== ingredientId));
  };

  const updateQuantity = (ingredientId: string, quantity: number) => {
    onRecipeChange(
      recipe.map((r) =>
        r.ingredientId === ingredientId ? { ...r, quantity } : r
      )
    );
  };

  return (
    <div style={styles.container}>
      <span style={styles.sectionTitle}>Recipe</span>
      <span style={styles.sectionSubtitle}>
        Define which ingredients are used to make this product
      </span>

      {recipe.length > 0 && (
        <div style={styles.recipeList}>
          {recipe.map((item) => (
            <div key={item.ingredientId} style={styles.recipeRow}>
              <span style={styles.ingredientName}>{item.ingredientName}</span>
              <input
                type="number"
                min="0"
                step="any"
                style={styles.qtyInput}
                placeholder="0"
                value={item.quantity || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateQuantity(item.ingredientId, isNaN(val) ? 0 : val);
                }}
              />
              <span style={styles.unitLabel}>{item.unit}</span>
              <button
                style={styles.removeBtn}
                onClick={() => removeIngredient(item.ingredientId)}
              >
                <FiTrash2 size={14} color="#dc2626" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.addRow}>
        {!showDropdown ? (
          <button
            style={styles.addBtn}
            onClick={() => setShowDropdown(true)}
          >
            <FiPlus size={14} color="#1e293b" />
            <span style={styles.addBtnText}>Add Ingredient</span>
          </button>
        ) : (
          <div style={styles.dropdownContainer}>
            <input
              autoFocus
              style={styles.dropdownSearch}
              placeholder="Search ingredients..."
              value={dropdownSearch}
              onChange={(e) => setDropdownSearch(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  setShowDropdown(false);
                  setDropdownSearch("");
                }, 200);
              }}
            />
            <div style={styles.dropdownList}>
              {filteredDropdown.length === 0 ? (
                <div style={styles.dropdownEmpty}>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>
                    {ingredients.length === 0
                      ? "No ingredients created yet. Add ingredients in Inventory first."
                      : "No matching ingredients"}
                  </span>
                </div>
              ) : (
                filteredDropdown.map((ing) => (
                  <button
                    key={ing.id}
                    style={styles.dropdownItem}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addIngredient(ing)}
                  >
                    <span style={styles.dropdownItemName}>{ing.name}</span>
                    <span style={styles.dropdownItemUnit}>
                      {ing.stockQuantity} {ing.unit} in stock
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  recipeList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  recipeRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    backgroundColor: "#f8f9fc",
    borderRadius: 8,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  qtyInput: {
    width: 70,
    height: 32,
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    padding: "0 8px",
    fontSize: 14,
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
  },
  unitLabel: {
    fontSize: 13,
    color: "#64748b",
    width: 40,
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  addRow: {
    marginTop: 4,
  },
  addBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px dashed #cbd5e1",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
  },
  dropdownContainer: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  dropdownSearch: {
    height: 36,
    border: "none",
    borderBottom: "1px solid #f1f5f9",
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  dropdownList: {
    maxHeight: 160,
    overflow: "auto",
  },
  dropdownEmpty: {
    padding: 16,
    textAlign: "center" as const,
  },
  dropdownItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderBottom: "1px solid #f8f9fc",
    backgroundColor: "#fff",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  dropdownItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  dropdownItemUnit: {
    fontSize: 12,
    color: "#94a3b8",
  },
};

export default RecipeEditor;
