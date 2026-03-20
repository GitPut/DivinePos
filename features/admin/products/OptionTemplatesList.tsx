import React, { useState } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiCopy, FiLayers, FiDownload } from "react-icons/fi";
import { optionTemplatesState } from "store/appState";
import {
  saveOptionTemplate,
  deleteOptionTemplate,
  syncOptionTemplateToProducts,
} from "services/firebase/functions";
import { storeProductsState } from "store/appState";
import { Option, OptionTemplate } from "types";
import { standardOptionTemplates } from "./components/productTemplates";
import Swal from "sweetalert2";
import { useAlert } from "react-alert";
import generateId from "utils/generateId";
import OptionsItemExpanded from "./components/OptionsItemExpanded";

function OptionTemplatesList() {
  const templates = optionTemplatesState.use();
  const catalog = storeProductsState.use();
  const [editingTemplate, setEditingTemplate] = useState<OptionTemplate | null>(null);
  const [localOption, setLocalOption] = useState<Option>({
    label: null,
    optionType: null,
    optionsList: [],
    isRequired: false,
    selectedCaseList: [],
    id: "",
  });
  const [templateName, setTemplateName] = useState("");
  const [newProductOptions, setNewProductOptions] = useState<Option[]>([]);
  const alertP = useAlert();

  const getLinkedCount = (templateId: string) =>
    catalog.products.filter((p) =>
      p.options.some((opt) => opt.templateId === templateId)
    ).length;

  const startNew = () => {
    const id = generateId(10);
    const newOption: Option = {
      label: null,
      optionType: null,
      optionsList: [],
      isRequired: false,
      selectedCaseList: [],
      id: id,
    };
    setEditingTemplate({ id: generateId(10), name: "", option: newOption });
    setLocalOption(newOption);
    setNewProductOptions([newOption]);
    setTemplateName("");
  };

  const startEdit = (template: OptionTemplate) => {
    setEditingTemplate(template);
    setLocalOption(structuredClone(template.option));
    setNewProductOptions([structuredClone(template.option)]);
    setTemplateName(template.name);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    if (!templateName.trim()) {
      alertP.error("Please enter a template name");
      return;
    }
    const opt = newProductOptions[0];
    if (!opt || !opt.label || !opt.optionType) {
      alertP.error("Please fill in the option name and type");
      return;
    }
    // Clean selections
    const cleanedOpt = {
      ...opt,
      optionsList: (opt.optionsList ?? []).filter(
        (s) => s.label && s.label.trim().length > 0
      ),
    };

    const template: OptionTemplate = {
      id: editingTemplate.id,
      name: templateName.trim(),
      option: cleanedOpt,
    };

    await saveOptionTemplate(template);

    // Sync to products that use this template
    const count = await syncOptionTemplateToProducts(template);
    if (count > 0) {
      alertP.show(`Updated ${count} product${count !== 1 ? "s" : ""}`);
    }

    setEditingTemplate(null);
    setNewProductOptions([]);
  };

  const handleDelete = (template: OptionTemplate) => {
    const linked = getLinkedCount(template.id);
    Swal.fire({
      title: "Delete template?",
      text: linked > 0
        ? `This template is used by ${linked} product${linked !== 1 ? "s" : ""}. The options will remain on those products but will no longer be linked.`
        : "This template will be permanently deleted.",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.value) {
        deleteOptionTemplate(template.id);
      }
    });
  };

  const handleDuplicate = (template: OptionTemplate) => {
    const newTemplate: OptionTemplate = {
      id: generateId(10),
      name: template.name + " Copy",
      option: { ...structuredClone(template.option), id: generateId(10) },
    };
    saveOptionTemplate(newTemplate);
  };

  // Dummy product for the OptionsItemExpanded (it only needs options for conditional logic)
  const dummyProduct = {
    name: "",
    price: "0",
    options: newProductOptions,
    description: "",
    id: "",
  };

  return (
    <div style={styles.container}>
      {editingTemplate ? (
        // ──── Editor View ────
        <div style={styles.editorContainer}>
          <div style={styles.editorHeader}>
            <div>
              <span style={styles.title}>
                {templates.find((t) => t.id === editingTemplate.id)
                  ? "Edit Template"
                  : "New Template"}
              </span>
              <span style={styles.subtitle}>
                Changes will sync to all products using this template
              </span>
            </div>
            <div style={styles.editorActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setEditingTemplate(null);
                  setNewProductOptions([]);
                }}
              >
                <span style={styles.cancelTxt}>Cancel</span>
              </button>
              <button style={styles.saveBtn} onClick={handleSave}>
                <span style={styles.saveTxt}>Save Template</span>
              </button>
            </div>
          </div>
          <div style={styles.editorScroll}>
            {/* Template Name */}
            <div style={styles.card}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Template Name</span>
                <input
                  style={styles.input}
                  placeholder='e.g. "Pizza Sizes", "Toppings", "Drink Add-ons"'
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  autoFocus
                />
                <span style={styles.fieldHint}>
                  This name is for your reference only — customers won't see it
                </span>
              </div>
            </div>

            {/* Option Editor */}
            <div style={styles.card}>
              <span style={styles.cardTitle}>Option Configuration</span>
              <OptionsItemExpanded
                item={localOption}
                newProduct={dummyProduct}
                newProductOptions={newProductOptions}
                setnewProductOptions={setNewProductOptions}
                index={0}
                e={newProductOptions[0] ?? localOption}
                sete={(val) => {
                  if (typeof val === "function") {
                    setNewProductOptions((prev) => {
                      const updated = val(prev[0]);
                      return [updated];
                    });
                  } else {
                    setNewProductOptions([val]);
                  }
                }}
                scrollY={0}
                setaddOptionClicked={() => {}}
                setmoveToOptionPos={() => {}}
                scrollToPositionIncluding={() => {}}
              />
            </div>
          </div>
        </div>
      ) : (
        // ──── List View ────
        <>
          <div style={styles.headerRow}>
            <div>
              <span style={styles.title}>Option Templates</span>
              <span style={styles.subtitle}>
                Create reusable options and link them to multiple products
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              {standardOptionTemplates.length > 0 && (
                <button
                  style={styles.importBtn}
                  onClick={async () => {
                    let imported = 0;
                    for (const std of standardOptionTemplates) {
                      const alreadyExists = templates.some((t) => t.name === std.name);
                      if (!alreadyExists) {
                        await saveOptionTemplate({
                          id: std.id,
                          name: std.name,
                          option: std.option as Option,
                        });
                        imported++;
                      }
                    }
                    if (imported > 0) {
                      alertP.show(`Imported ${imported} template${imported !== 1 ? "s" : ""}`);
                    } else {
                      alertP.show("All standard templates already imported");
                    }
                  }}
                >
                  <FiDownload size={15} color="#475569" />
                  <span style={styles.importBtnTxt}>Import Standard</span>
                </button>
              )}
              <button style={styles.addBtn} onClick={startNew}>
                <FiPlus size={16} color="#fff" />
                <span style={styles.addBtnTxt}>New Template</span>
              </button>
            </div>
          </div>

          <div style={styles.scrollArea}>
            {templates.length > 0 ? (
              <div style={styles.grid}>
                {templates.map((template) => {
                  const linked = getLinkedCount(template.id);
                  const opt = template.option;
                  const choiceCount = opt.optionsList?.length ?? 0;
                  return (
                    <div key={template.id} style={styles.templateCard}>
                      <div style={styles.cardHeader}>
                        <div style={styles.cardIcon}>
                          <FiLayers size={18} color="#1D294E" />
                        </div>
                        <div style={styles.cardInfo}>
                          <span style={styles.cardName}>{template.name}</span>
                          <span style={styles.cardOptionName}>
                            {opt.label || "Unnamed option"} · {opt.optionType || "No type"}
                          </span>
                        </div>
                      </div>
                      <div style={styles.cardStats}>
                        <div style={styles.stat}>
                          <span style={styles.statNum}>{choiceCount}</span>
                          <span style={styles.statLabel}>
                            {choiceCount === 1 ? "choice" : "choices"}
                          </span>
                        </div>
                        <div style={styles.stat}>
                          <span style={styles.statNum}>{linked}</span>
                          <span style={styles.statLabel}>
                            {linked === 1 ? "product" : "products"}
                          </span>
                        </div>
                      </div>
                      {choiceCount > 0 && (
                        <div style={styles.choicePreview}>
                          {opt.optionsList.slice(0, 4).map((choice) => (
                            <span key={choice.id} style={styles.choicePill}>
                              {choice.label}
                              {choice.priceIncrease && parseFloat(choice.priceIncrease) !== 0
                                ? ` (+$${choice.priceIncrease})`
                                : ""}
                            </span>
                          ))}
                          {choiceCount > 4 && (
                            <span style={styles.choiceMore}>
                              +{choiceCount - 4} more
                            </span>
                          )}
                        </div>
                      )}
                      <div style={styles.cardActions}>
                        <button
                          style={styles.editCardBtn}
                          onClick={() => startEdit(template)}
                        >
                          <FiEdit3 size={14} color="#64748b" />
                          <span style={styles.editCardTxt}>Edit</span>
                        </button>
                        <button
                          style={styles.iconCardBtn}
                          onClick={() => handleDuplicate(template)}
                          title="Duplicate"
                        >
                          <FiCopy size={14} color="#64748b" />
                        </button>
                        <button
                          style={styles.deleteCardBtn}
                          onClick={() => handleDelete(template)}
                          title="Delete"
                        >
                          <FiTrash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <FiLayers size={40} color="#cbd5e1" />
                </div>
                <span style={styles.emptyTitle}>No option templates yet</span>
                <span style={styles.emptySubtitle}>
                  Create templates like "Sizes", "Toppings", or "Add-ons" and reuse
                  them across products
                </span>
                <button style={styles.addBtn} onClick={startNew}>
                  <FiPlus size={16} color="#fff" />
                  <span style={styles.addBtnTxt}>Create Your First Template</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  // Header
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexShrink: 0,
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  importBtn: {
    height: 40,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 6,
    paddingLeft: 14,
    paddingRight: 14,
    cursor: "pointer",
  },
  importBtnTxt: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  addBtn: {
    height: 40,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 16,
    paddingRight: 16,
    cursor: "pointer",
  },
  addBtnTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    paddingBottom: 20,
  },
  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 14,
  },
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardHeader: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardOptionName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  cardStats: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statNum: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  choicePreview: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  choicePill: {
    fontSize: 11,
    fontWeight: "500",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: 4,
  },
  choiceMore: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
    padding: "3px 4px",
  },
  cardActions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTop: "1px solid #f1f5f9",
    paddingTop: 12,
  },
  editCardBtn: {
    height: 32,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    cursor: "pointer",
    flex: 1,
    justifyContent: "center",
  },
  editCardTxt: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  iconCardBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  deleteCardBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  // Empty
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "60px 20px",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center" as const,
    maxWidth: 400,
    marginBottom: 8,
  },
  // Editor
  editorContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  editorHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexShrink: 0,
    flexWrap: "wrap",
    gap: 16,
  },
  editorActions: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  cancelBtn: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  cancelTxt: {
    fontWeight: "600",
    color: "#475569",
    fontSize: 13,
  },
  saveBtn: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  saveTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 13,
  },
  editorScroll: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  fieldHint: {
    fontSize: 12,
    color: "#94a3b8",
  },
  input: {
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 15,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
};

export default OptionTemplatesList;
