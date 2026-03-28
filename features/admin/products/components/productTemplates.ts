// ===== STANDARD OPTION TEMPLATES =====
// These can be imported into the Option Templates system

export const standardOptionTemplates = [
  {
    id: "std_pizza_sizes",
    name: "Pizza Sizes",
    option: {
      label: "Size",
      optionType: "Row",
      isRequired: true,
      numOfSelectable: "1",
      id: "evprm3i4e",
      selectedCaseList: [],
      defaultValue: { priceIncrease: null, id: "pd3hk8mquo", label: "Small" },
      optionsList: [
        { label: "Small", id: "pd3hk8mquo", selected: true, priceIncrease: null },
        { priceIncrease: "1.58", id: "ue6z8coqet", label: "Medium", selected: false },
        { label: "Large", id: "l28qi0uanq", priceIncrease: "1.35" },
        { label: "X-Large", id: "g7efrjcac6", priceIncrease: "3.82" },
      ],
    },
  },
  {
    id: "std_crust_options",
    name: "Crust Options",
    option: {
      label: "Crust Option",
      optionType: "Row",
      numOfSelectable: null,
      id: "87wq2vjnm",
      selectedCaseList: [],
      optionsList: [
        { priceIncrease: null, id: "anizsuxokz", label: "Thin Crust" },
        { priceIncrease: "1", id: "sqpdbv4udo", label: "Thick Crust" },
        { priceIncrease: null, id: "2225iu2hrk", label: "Light On Cheese" },
        { priceIncrease: null, label: "No Cheese", id: "s11dycmgxa" },
        { priceIncrease: null, id: "sqtngqi9gv", label: "Well Done" },
        { id: "2wjmzqkmti", label: "Light On Sauce", priceIncrease: null },
        { label: "No Sauce", id: "m5owavh1fp", priceIncrease: null },
        { priceIncrease: null, label: "Extra Sauce", id: "35frunlgva" },
      ],
    },
  },
  {
    id: "std_base_sauce",
    name: "Pizza Base Sauce",
    option: {
      label: "Base Sauce",
      optionType: "Row",
      numOfSelectable: "1",
      id: "6clc4a9pr",
      sizeLinkedOptionLabel: "Size",
      selectedCaseList: [],
      defaultValue: { priceIncrease: null, id: "w9sclu9ra1", label: "Tomato Sauce", selected: true },
      optionsList: [
        { label: "Tomato Sauce", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, priceIncrease: null, selected: true, id: "w9sclu9ra1" },
        { label: "Garlic Sauce", id: "wu3kzywi1r", selected: false, priceIncrease: "1.11", priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" } },
        { priceIncrease: "1.11", priceBySize: { Small: "1", "X-Large": "4", Medium: "2", Large: "3" }, label: "B.B.Q Sauce", id: "eykmoh2yry" },
        { priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11", label: "Pesto Sauce", id: "ruzwfdh6sn" },
        { label: "Alfredo Sauce", id: "uc0b0o8cfo", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11" },
      ],
    },
  },
  {
    id: "std_pizza_toppings",
    name: "Pizza Toppings",
    option: {
      label: "Toppings",
      optionType: "Table View",
      numOfSelectable: "",
      id: "8nd7jmt4t",
      sizeLinkedOptionLabel: "Size",
      allowHalfAndHalf: true,
      selectedCaseList: [],
      optionsList: [
        { id: "yyl1kdotdw", label: "Pepperoni", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11" },
        { label: "Bacon", id: "dog44sq46c", priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11" },
        { priceIncrease: "1.11", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, label: "Ham", id: "f8jympp7kh" },
        { priceBySize: { Large: "3", Medium: "2", "X-Large": "4", Small: "1" }, priceIncrease: "1.11", label: "Italian Sausage", id: "texlhg0r0s" },
        { priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11", label: "Salami", id: "49pvnosj8i" },
        { priceIncrease: "1.11", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, id: "aszkf4a77d", label: "Ground Beef" },
        { id: "myi7b40hyn", label: "Chicken", priceIncrease: "1.11", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" } },
        { label: "Anchovies", id: "we4uhontcj", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } },
        { id: "wn790ugw0m", label: "Bacon Strips", priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11" },
        { priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11", label: "Tomato", id: "16mw14s76h" },
        { label: "Red Onion", id: "f7pb8t2k6e", priceIncrease: "1.11", priceBySize: { Large: "3", Medium: "2", "X-Large": "4", Small: "1" } },
        { priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, priceIncrease: "1.11", label: "Green Olives", id: "c69u9pl43t" },
        { label: "Mushrooms", id: "alll1ag645", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } },
        { priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" }, priceIncrease: "1.11", label: "Green Peppers", id: "tz91k1lm2i" },
        { priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11", label: "Black Olives", id: "awdvzmqfe6" },
        { label: "Onion", id: "ggjri58urh", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11" },
        { id: "w1ab3pdj0w", label: "Pineapple", priceIncrease: "1.11", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" } },
        { priceIncrease: "1.11", priceBySize: { Small: "1", "X-Large": "4", Medium: "2", Large: "3" }, id: "4c41g8egf7", label: "Hot Peppers" },
        { priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, priceIncrease: "1.11", id: "7xpxpccfvn", label: "Artichoke Hearts" },
        { label: "Jalapino Peppers", id: "s7t7kn62hg", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } },
        { priceIncrease: "1.11", priceBySize: { Large: "3", Medium: "2", "X-Large": "4", Small: "1" }, id: "92qksocpax", label: "Fresh Garlic" },
        { priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" }, priceIncrease: "1.11", label: "Spinach", id: "b48lwtpk0p" },
        { id: "famnzonkwf", label: "Red Peppers", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11" },
        { id: "vkty20sdqk", label: "Grilled Zucchini", priceIncrease: "1.11", priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" } },
        { priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11", label: "Fried Eggplant", id: "r4c4rdux74" },
        { id: "g80jloc747", label: "Fresh Basil", priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11" },
        { priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" }, priceIncrease: "1.11", label: "Caramelized Onion", id: "mz4mgtu0dm" },
        { priceIncrease: "1.11", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, label: "Mozzarella", id: "toun6vy96l" },
        { label: "Cheddar", id: "n4a55naow2", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", "X-Large": "4", Medium: "2" } },
        { priceBySize: { Small: "1", Large: "3", Medium: "2" }, priceIncrease: "1.11", label: "Feta", id: "9in9fmkg0w" },
        { id: "jd5099btvq", label: "Parmigiano", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } },
        { id: "zj1258kjvo", label: "Fior Di Latte", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11" },
      ],
    },
  },
];

// ===== PRODUCT TEMPLATES =====

const BuildYourOwnPizza = {
  id: "templateIDy3tmsgje2",
  name: "Build Your Own Pizza",
  description: "Build your own pizza with your choice of toppings",
  price: "6.50",
  imageUrl: "https://firebasestorage.googleapis.com/v0/b/posmate-5fc0a.appspot.com/o/J6rAf2opwnSKAhefbOZW6HJdx1h2%2Fimages%2Fy3tmsgje2?alt=media&token=f8bfa85d-2b9e-40b9-87c3-540ddff11ead",
  hasImage: true,
  category: "Pizza",
  options: [
    { selectedCaseValue: null, defaultValue: { priceIncrease: null, id: "pd3hk8mquo", label: "Small" }, isRequired: true, selectedCaseKey: null, optionsList: [ { label: "Small", id: "pd3hk8mquo", selected: true, priceIncrease: null }, { priceIncrease: "1.58", id: "ue6z8coqet", label: "Medium", selected: false }, { label: "Large", id: "l28qi0uanq", priceIncrease: "1.35" }, { label: "X-Large", id: "g7efrjcac6", priceIncrease: "3.82" } ], numOfSelectable: "1", optionType: "Row", label: "Size", id: "evprm3i4e" },
    { selectedCaseValue: null, id: "87wq2vjnm", selectedCaseKey: null, optionsList: [ { priceIncrease: null, id: "anizsuxokz", label: "Thin Crust" }, { priceIncrease: "1", id: "sqpdbv4udo", label: "Thick Crust" }, { priceIncrease: null, id: "2225iu2hrk", label: "Light On Cheese" }, { priceIncrease: null, label: "No Cheese", id: "s11dycmgxa" }, { priceIncrease: null, id: "sqtngqi9gv", label: "Well Done" }, { id: "2wjmzqkmti", label: "Light On Sauce", priceIncrease: null }, { label: "No Sauce", id: "m5owavh1fp", priceIncrease: null }, { priceIncrease: null, label: "Extra Sauce", id: "35frunlgva" } ], numOfSelectable: null, optionType: "Row", label: "Crust Option" },
    { selectedCaseValue: null, defaultValue: { priceIncrease: null, id: "w9sclu9ra1", label: "Tomato Sauce", selected: true }, label: "Base Sauce", optionType: "Row", numOfSelectable: "1", selectedCaseKey: null, optionsList: [ { label: "Tomato Sauce", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, priceIncrease: null, selected: true, id: "w9sclu9ra1" }, { label: "Garlic Sauce", id: "wu3kzywi1r", selected: false, priceIncrease: "1.11", priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" } }, { priceIncrease: "1.11", priceBySize: { Small: "1", "X-Large": "4", Medium: "2", Large: "3" }, label: "B.B.Q Sauce", id: "eykmoh2yry" }, { priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11", label: "Pesto Sauce", id: "ruzwfdh6sn" }, { label: "Alfredo Sauce", id: "uc0b0o8cfo", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11" } ], id: "6clc4a9pr", sizeLinkedOptionLabel: "Size", selectedCaseList: [] },
    { selectedCaseList: [], viewType: "Table", id: "8nd7jmt4t", sizeLinkedOptionLabel: "Size", optionType: "Table View", numOfSelectable: "", selectedCaseKey: null, optionsList: [ { id: "yyl1kdotdw", label: "Pepperoni", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11" }, { label: "Bacon", id: "dog44sq46c", priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11" }, { priceIncrease: "1.11", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, label: "Ham", id: "f8jympp7kh" }, { priceBySize: { Large: "3", Medium: "2", "X-Large": "4", Small: "1" }, priceIncrease: "1.11", label: "Italian Sausage", id: "texlhg0r0s" }, { priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11", label: "Salami", id: "49pvnosj8i" }, { priceIncrease: "1.11", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, id: "aszkf4a77d", label: "Ground Beef" }, { id: "myi7b40hyn", label: "Chicken", priceIncrease: "1.11", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" } }, { label: "Anchovies", id: "we4uhontcj", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } }, { id: "wn790ugw0m", label: "Bacon Strips", priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11" }, { priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11", label: "Tomato", id: "16mw14s76h" }, { label: "Red Onion", id: "f7pb8t2k6e", priceIncrease: "1.11", priceBySize: { Large: "3", Medium: "2", "X-Large": "4", Small: "1" } }, { priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, priceIncrease: "1.11", label: "Green Olives", id: "c69u9pl43t" }, { label: "Mushrooms", id: "alll1ag645", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } }, { priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" }, priceIncrease: "1.11", label: "Green Peppers", id: "tz91k1lm2i" }, { priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11", label: "Black Olives", id: "awdvzmqfe6" }, { label: "Onion", id: "ggjri58urh", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11" }, { id: "w1ab3pdj0w", label: "Pineapple", priceIncrease: "1.11", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" } }, { priceIncrease: "1.11", priceBySize: { Small: "1", "X-Large": "4", Medium: "2", Large: "3" }, id: "4c41g8egf7", label: "Hot Peppers" }, { priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, priceIncrease: "1.11", id: "7xpxpccfvn", label: "Artichoke Hearts" }, { label: "Jalapino Peppers", id: "s7t7kn62hg", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } }, { priceIncrease: "1.11", priceBySize: { Large: "3", Medium: "2", "X-Large": "4", Small: "1" }, id: "92qksocpax", label: "Fresh Garlic" }, { priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" }, priceIncrease: "1.11", label: "Spinach", id: "b48lwtpk0p" }, { id: "famnzonkwf", label: "Red Peppers", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11" }, { id: "vkty20sdqk", label: "Grilled Zucchini", priceIncrease: "1.11", priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" } }, { priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" }, priceIncrease: "1.11", label: "Fried Eggplant", id: "r4c4rdux74" }, { id: "g80jloc747", label: "Fresh Basil", priceBySize: { Medium: "2", "X-Large": "4", Large: "3", Small: "1" }, priceIncrease: "1.11" }, { priceBySize: { Large: "3", "X-Large": "4", Medium: "2", Small: "1" }, priceIncrease: "1.11", label: "Caramelized Onion", id: "mz4mgtu0dm" }, { priceIncrease: "1.11", priceBySize: { Small: "1", Medium: "2", "X-Large": "4", Large: "3" }, label: "Mozzarella", id: "toun6vy96l" }, { label: "Cheddar", id: "n4a55naow2", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", "X-Large": "4", Medium: "2" } }, { priceBySize: { Small: "1", Large: "3", Medium: "2" }, priceIncrease: "1.11", label: "Feta", id: "9in9fmkg0w" }, { id: "jd5099btvq", label: "Parmigiano", priceIncrease: "1.11", priceBySize: { Small: "1", Large: "3", Medium: "2", "X-Large": "4" } }, { id: "zj1258kjvo", label: "Fior Di Latte", priceBySize: { "X-Large": "4", Medium: "2", Large: "3", Small: "1" }, priceIncrease: "1.11" } ], label: "Toppings", allowHalfAndHalf: true, selectedCaseValue: null },
  ],
};

const DoublePizzaCombo = {
  id: "wcog43pki",
  name: "Double Pizzas Combo 3",
  description: "Double pizza combo with 3 toppings each",
  imageUrl:
    "https://firebasestorage.googleapis.com/v0/b/posmate-5fc0a.appspot.com/o/J6rAf2opwnSKAhefbOZW6HJdx1h2%2Fimages%2F5ff35dmtp?alt=media&token=35c94c88-1514-4c75-a6f1-18149a2f23fa",
  price: "25.99",
  isTemplate: true,
  hasImage: true,
  category: "Combos",
  options: [
    {
      isRequired: true,
      optionType: "Row",
      id: "evprm3i4e",
      numOfSelectable: "1",
      optionsList: [
        { priceIncrease: null, id: "5yo0fdxaxu", label: "Md", selected: true },
        { id: "elpa1tjpyw", label: "Lg", priceIncrease: "5" },
        { label: "X-Lg", id: "tjdgxxex5f", priceIncrease: "10" },
      ],
      label: "Size",
      defaultValue: { priceIncrease: null, id: "5yo0fdxaxu", label: "Md" },
    },
    {
      numOfSelectable: "",
      id: "8nd7jmt4t",
      optionsList: [
        { id: "k4fxvsszu8", label: "Pepperoni", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "5d6ke0ozhe", priceIncrease: null, label: "Bacon", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "246hei81mo", label: "Ham", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "w6ujkml7uy", label: "Italian Sausage", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "dv6wzffah2", label: "Salami", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Ground Beef", id: "v6oebueg0b", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Chicken", priceIncrease: null, id: "0qvrb7v98o", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Anchovies", id: "54urkwk3p9", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "9f7pk1dtd4", label: "Bacon Strips", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Tomato", priceIncrease: null, id: "vmohpm21ej", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "jfeylm66i3", label: "Red Onion", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Green Olives", id: "bjq10k8uoy", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "e0hfeu1lvc", priceIncrease: null, label: "Mushrooms", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Green Peppers", priceIncrease: null, id: "vwth10u9ft", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "2k97ptd3zc", priceIncrease: null, label: "Black Olives", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "b0fitdvwck", label: "Onion", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Pineapple", id: "zl9369e1nd", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Hot Peppers", id: "dzmw10ytmi", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "k1gwj0joud", priceIncrease: null, label: "Artichoke Hearts", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "p7bnxc9f27", label: "Jalapino Peppers", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Fresh Garlic", id: "ahjkc5aylz", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "qp2xx6qau5", priceIncrease: null, label: "Spinach", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "fddjoeglsc", label: "Red Peppers", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "9urwe2xdjg", label: "Grilled Zucchini", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "rrgy7wefrf", priceIncrease: null, label: "Fried Eggplant", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "l8qt5pu2zd", label: "Fresh Basil", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "01wrxilkt7", priceIncrease: null, label: "Caramelized Onion", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Mozzarella", id: "g2iyszu5vh", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "bvayrxb7eh", label: "Cheddar", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Feta", id: "b2kkf10x2k", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Parmigiano", priceIncrease: null, id: "s5ctrpurk0", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "qf79685qkp", label: "Fior Di Latte", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
      ],
      optionType: "Included Selections",
      label: "Pizza 1 Toppings",
      includedSelections: "3",
      allowHalfAndHalf: true,
      includedDisplayStyle: "Table View",
      sizeLinkedOptionLabel: "Size",
      extraSelectionPrice: "",
    },
    {
      numOfSelectable: "",
      id: "cv73b3uo5",
      optionsList: [
        { id: "k4fxvsszu8", label: "Pepperoni", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "5d6ke0ozhe", priceIncrease: null, label: "Bacon", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "246hei81mo", label: "Ham", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "w6ujkml7uy", label: "Italian Sausage", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "dv6wzffah2", label: "Salami", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Ground Beef", id: "v6oebueg0b", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Chicken", priceIncrease: null, id: "0qvrb7v98o", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Anchovies", id: "54urkwk3p9", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "9f7pk1dtd4", label: "Bacon Strips", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Tomato", priceIncrease: null, id: "vmohpm21ej", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "jfeylm66i3", label: "Red Onion", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Green Olives", id: "bjq10k8uoy", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "e0hfeu1lvc", priceIncrease: null, label: "Mushrooms", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Green Peppers", priceIncrease: null, id: "vwth10u9ft", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "2k97ptd3zc", priceIncrease: null, label: "Black Olives", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "b0fitdvwck", label: "Onion", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Pineapple", id: "zl9369e1nd", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Hot Peppers", id: "dzmw10ytmi", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "k1gwj0joud", priceIncrease: null, label: "Artichoke Hearts", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "p7bnxc9f27", label: "Jalapino Peppers", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Fresh Garlic", id: "ahjkc5aylz", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "qp2xx6qau5", priceIncrease: null, label: "Spinach", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "fddjoeglsc", label: "Red Peppers", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "9urwe2xdjg", label: "Grilled Zucchini", priceIncrease: null, priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "rrgy7wefrf", priceIncrease: null, label: "Fried Eggplant", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "l8qt5pu2zd", label: "Fresh Basil", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { id: "01wrxilkt7", priceIncrease: null, label: "Caramelized Onion", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Mozzarella", id: "g2iyszu5vh", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "bvayrxb7eh", label: "Cheddar", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, label: "Feta", id: "b2kkf10x2k", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { label: "Parmigiano", priceIncrease: null, id: "s5ctrpurk0", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
        { priceIncrease: null, id: "qf79685qkp", label: "Fior Di Latte", priceBySize: { Md: "0.5", Lg: "1", "X-Lg": "1.5" } },
      ],
      optionType: "Included Selections",
      label: "Pizza 2 Toppings",
      includedSelections: "3",
      allowHalfAndHalf: true,
      includedDisplayStyle: "Table View",
      sizeLinkedOptionLabel: "Size",
    },
    {
      numOfSelectable: "2",
      optionType: "Quantity Dropdown",
      optionsList: [
        { priceIncrease: null, id: "bm9gavqgvq", label: "Creamy Garlic Dip" },
        { label: "Cheddar Chipotle Dip", priceIncrease: null, id: "2yu7pqldzr" },
        { id: "h2203sqzha", label: "Marinara Dip", priceIncrease: null },
        { priceIncrease: null, label: "Creamy Ranch Dip", id: "0s048ya4cr" },
        { id: "nsqhhbt5ef", priceIncrease: null, label: "Blue Cheese Dip" },
      ],
      label: "2 Dip Sauce",
      id: "lbhkbdn3s",
    },
    {
      id: "pjwk8sqtt",
      optionsList: [
        { label: "Pepsi", id: "7o3nn246c3", priceIncrease: null },
        { label: "Diet Pepsi", priceIncrease: null, id: "osunu97r3c" },
        { id: "tupjd0gt7o", label: "Coke", priceIncrease: null },
        { priceIncrease: null, label: "Diet Coke", id: "skdkxbbk2r" },
        { priceIncrease: null, id: "jqca3m0abt", label: "Ice Tea" },
        { priceIncrease: null, label: "Root Beer", id: "30qwafwbt8" },
        { label: "Canada Dry", priceIncrease: null, id: "9ivjfkwewv" },
        { id: "wln1lh7uhm", priceIncrease: null, label: "Mountain Dew" },
        { id: "xd92bfpl2d", label: "Crush Orange", priceIncrease: null },
        { priceIncrease: null, label: "Dr Pepper", id: "g30cw1mhz7" },
        { id: "l5kxx5xz7t", label: "Cherry Coke", priceIncrease: null },
      ],
      label: "2 Pop",
      numOfSelectable: "2",
      optionType: "Quantity Dropdown",
    },
    {
      id: "87wq2vjnm",
      optionType: "Quantity Dropdown",
      label: "Crust Option",
      optionsList: [
        { label: "Thin Crust", id: "tuis1nvz4r", priceIncrease: null },
        { priceIncrease: "1", id: "ek2pjfmfgw", label: "Thick Crust" },
        { id: "ok4k3gg7it", label: "Light On Cheese", priceIncrease: null },
        { priceIncrease: null, label: "No Cheese", id: "9q771iv5hj" },
        { priceIncrease: null, label: "Well Done", id: "xue26uq3he" },
        { priceIncrease: null, label: "Light On Sauce", id: "3yqogmkpa2" },
        { label: "No Sauce", priceIncrease: null, id: "38jpzq54m7" },
        { priceIncrease: null, label: "Extra Sauce", id: "5t0q1ila8m" },
      ],
    },
  ],
};

// ===== COFFEE & DRINKS =====

const CoffeeTemplate = {
  id: "templateCoffee001",
  name: "Coffee",
  description: "Freshly brewed coffee with customizable size and add-ons",
  category: "Coffee & Drinks",
  price: "3.50",
  options: [
    {
      id: "cofSize1", label: "Size", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      defaultValue: { label: "Medium", id: "cofSm2", priceIncrease: null },
      optionsList: [
        { id: "cofSm1", label: "Small", priceIncrease: "-0.50", selected: false },
        { id: "cofSm2", label: "Medium", priceIncrease: null, selected: true },
        { id: "cofSm3", label: "Large", priceIncrease: "1.00" },
      ],
    },
    {
      id: "cofMilk1", label: "Milk", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "cofMk1", label: "Regular", priceIncrease: null },
        { id: "cofMk2", label: "2%", priceIncrease: null },
        { id: "cofMk3", label: "Oat Milk", priceIncrease: "0.75" },
        { id: "cofMk4", label: "Almond Milk", priceIncrease: "0.75" },
        { id: "cofMk5", label: "No Milk", priceIncrease: null },
      ],
    },
    {
      id: "cofExtra1", label: "Extras", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "cofEx1", label: "Extra Shot", priceIncrease: "0.75" },
        { id: "cofEx2", label: "Vanilla Syrup", priceIncrease: "0.50" },
        { id: "cofEx3", label: "Caramel Syrup", priceIncrease: "0.50" },
        { id: "cofEx4", label: "Hazelnut Syrup", priceIncrease: "0.50" },
        { id: "cofEx5", label: "Whipped Cream", priceIncrease: "0.50" },
      ],
    },
  ],
};

const IcedLatteTemplate = {
  id: "templateLatte001",
  name: "Iced Latte",
  description: "Espresso over ice with your choice of milk",
  category: "Coffee & Drinks",
  price: "5.25",
  options: [
    {
      id: "latSize1", label: "Size", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      defaultValue: { label: "Medium", id: "latSz2", priceIncrease: null },
      optionsList: [
        { id: "latSz1", label: "Small", priceIncrease: "-0.75" },
        { id: "latSz2", label: "Medium", priceIncrease: null, selected: true },
        { id: "latSz3", label: "Large", priceIncrease: "1.25" },
      ],
    },
    {
      id: "latMilk1", label: "Milk", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      defaultValue: { label: "2%", id: "latMk1", priceIncrease: null },
      optionsList: [
        { id: "latMk1", label: "2%", priceIncrease: null, selected: true },
        { id: "latMk2", label: "Whole", priceIncrease: null },
        { id: "latMk3", label: "Oat", priceIncrease: "0.75" },
        { id: "latMk4", label: "Almond", priceIncrease: "0.75" },
        { id: "latMk5", label: "Coconut", priceIncrease: "0.75" },
      ],
    },
    {
      id: "latFlavor1", label: "Flavor", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "latFl1", label: "Vanilla", priceIncrease: "0.50" },
        { id: "latFl2", label: "Caramel", priceIncrease: "0.50" },
        { id: "latFl3", label: "Mocha", priceIncrease: "0.75" },
        { id: "latFl4", label: "Lavender", priceIncrease: "0.75" },
      ],
    },
  ],
};

const SmoothieTemplate = {
  id: "templateSmoothie001",
  name: "Smoothie",
  description: "Fresh fruit smoothie blended to order",
  category: "Coffee & Drinks",
  price: "6.50",
  options: [
    {
      id: "smBase1", label: "Base", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "smBs1", label: "Mango", priceIncrease: null },
        { id: "smBs2", label: "Strawberry Banana", priceIncrease: null },
        { id: "smBs3", label: "Mixed Berry", priceIncrease: null },
        { id: "smBs4", label: "Tropical", priceIncrease: null },
        { id: "smBs5", label: "Green", priceIncrease: "0.50" },
      ],
    },
    {
      id: "smAdd1", label: "Add-ons", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "smAd1", label: "Protein Powder", priceIncrease: "1.50" },
        { id: "smAd2", label: "Peanut Butter", priceIncrease: "1.00" },
        { id: "smAd3", label: "Chia Seeds", priceIncrease: "0.75" },
        { id: "smAd4", label: "Spinach", priceIncrease: "0.50" },
      ],
    },
  ],
};

// ===== BURGERS =====

const ClassicBurgerTemplate = {
  id: "templateBurger001",
  name: "Classic Burger",
  description: "Beef patty with your choice of toppings",
  category: "Burgers",
  price: "10.99",
  options: [
    {
      id: "brgPatty1", label: "Patty", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      defaultValue: { label: "Single", id: "brgPt1", priceIncrease: null },
      optionsList: [
        { id: "brgPt1", label: "Single", priceIncrease: null, selected: true },
        { id: "brgPt2", label: "Double", priceIncrease: "3.50" },
        { id: "brgPt3", label: "Beyond Meat", priceIncrease: "2.00" },
      ],
    },
    {
      id: "brgCheese1", label: "Cheese", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "brgCh1", label: "American", priceIncrease: null },
        { id: "brgCh2", label: "Cheddar", priceIncrease: null },
        { id: "brgCh3", label: "Swiss", priceIncrease: null },
        { id: "brgCh4", label: "Pepper Jack", priceIncrease: "0.50" },
        { id: "brgCh5", label: "No Cheese", priceIncrease: null },
      ],
    },
    {
      id: "brgTop1", label: "Toppings", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "brgTp1", label: "Lettuce", priceIncrease: null },
        { id: "brgTp2", label: "Tomato", priceIncrease: null },
        { id: "brgTp3", label: "Onion", priceIncrease: null },
        { id: "brgTp4", label: "Pickles", priceIncrease: null },
        { id: "brgTp5", label: "Bacon", priceIncrease: "1.50" },
        { id: "brgTp6", label: "Mushrooms", priceIncrease: "1.00" },
        { id: "brgTp7", label: "Avocado", priceIncrease: "1.50" },
        { id: "brgTp8", label: "Jalapenos", priceIncrease: "0.50" },
      ],
    },
    {
      id: "brgSauce1", label: "Sauce", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "brgSc1", label: "Ketchup", priceIncrease: null },
        { id: "brgSc2", label: "Mayo", priceIncrease: null },
        { id: "brgSc3", label: "BBQ", priceIncrease: null },
        { id: "brgSc4", label: "Chipotle Mayo", priceIncrease: null },
        { id: "brgSc5", label: "Hot Sauce", priceIncrease: null },
      ],
    },
  ],
};

// ===== SANDWICHES =====

const SubSandwichTemplate = {
  id: "templateSub001",
  name: "Sub Sandwich",
  description: "Build your own sub with fresh ingredients",
  category: "Sandwiches",
  price: "8.99",
  options: [
    {
      id: "subBread1", label: "Bread", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "subBr1", label: "White", priceIncrease: null },
        { id: "subBr2", label: "Whole Wheat", priceIncrease: null },
        { id: "subBr3", label: "Italian Herb", priceIncrease: null },
        { id: "subBr4", label: "Wrap", priceIncrease: null },
      ],
    },
    {
      id: "subSize1", label: "Size", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      defaultValue: { label: "Regular (6\")", id: "subSz1", priceIncrease: null },
      optionsList: [
        { id: "subSz1", label: "Regular (6\")", priceIncrease: null, selected: true },
        { id: "subSz2", label: "Large (12\")", priceIncrease: "4.00" },
      ],
    },
    {
      id: "subMeat1", label: "Protein", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "subMt1", label: "Turkey", priceIncrease: null },
        { id: "subMt2", label: "Ham", priceIncrease: null },
        { id: "subMt3", label: "Chicken", priceIncrease: null },
        { id: "subMt4", label: "Tuna", priceIncrease: null },
        { id: "subMt5", label: "Veggie", priceIncrease: null },
        { id: "subMt6", label: "Steak", priceIncrease: "2.00" },
      ],
    },
    {
      id: "subTop1", label: "Toppings", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "subTp1", label: "Lettuce", priceIncrease: null },
        { id: "subTp2", label: "Tomato", priceIncrease: null },
        { id: "subTp3", label: "Onion", priceIncrease: null },
        { id: "subTp4", label: "Peppers", priceIncrease: null },
        { id: "subTp5", label: "Olives", priceIncrease: null },
        { id: "subTp6", label: "Extra Cheese", priceIncrease: "1.00" },
        { id: "subTp7", label: "Avocado", priceIncrease: "1.50" },
      ],
    },
  ],
};

// ===== SALADS =====

const SaladTemplate = {
  id: "templateSalad001",
  name: "Build Your Own Salad",
  description: "Fresh salad with your choice of greens, protein, and dressing",
  category: "Salads",
  price: "9.99",
  options: [
    {
      id: "salBase1", label: "Base", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "salBs1", label: "Romaine", priceIncrease: null },
        { id: "salBs2", label: "Mixed Greens", priceIncrease: null },
        { id: "salBs3", label: "Spinach", priceIncrease: null },
        { id: "salBs4", label: "Kale", priceIncrease: null },
      ],
    },
    {
      id: "salProt1", label: "Protein", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "salPr1", label: "Grilled Chicken", priceIncrease: "3.00" },
        { id: "salPr2", label: "Crispy Chicken", priceIncrease: "3.00" },
        { id: "salPr3", label: "Shrimp", priceIncrease: "4.00" },
        { id: "salPr4", label: "Steak", priceIncrease: "4.50" },
        { id: "salPr5", label: "Tofu", priceIncrease: "2.00" },
      ],
    },
    {
      id: "salTop1", label: "Toppings", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "salTp1", label: "Tomatoes", priceIncrease: null },
        { id: "salTp2", label: "Cucumber", priceIncrease: null },
        { id: "salTp3", label: "Red Onion", priceIncrease: null },
        { id: "salTp4", label: "Croutons", priceIncrease: null },
        { id: "salTp5", label: "Cheese", priceIncrease: "0.75" },
        { id: "salTp6", label: "Avocado", priceIncrease: "1.50" },
        { id: "salTp7", label: "Bacon Bits", priceIncrease: "1.00" },
        { id: "salTp8", label: "Hard Boiled Egg", priceIncrease: "1.00" },
      ],
    },
    {
      id: "salDress1", label: "Dressing", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "salDr1", label: "Caesar", priceIncrease: null },
        { id: "salDr2", label: "Ranch", priceIncrease: null },
        { id: "salDr3", label: "Italian", priceIncrease: null },
        { id: "salDr4", label: "Balsamic", priceIncrease: null },
        { id: "salDr5", label: "Oil & Vinegar", priceIncrease: null },
      ],
    },
  ],
};

// ===== BREAKFAST =====

const BreakfastSandwichTemplate = {
  id: "templateBreak001",
  name: "Breakfast Sandwich",
  description: "Egg sandwich on your choice of bread",
  category: "Breakfast",
  price: "5.99",
  options: [
    {
      id: "brkBread1", label: "Bread", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "brkBr1", label: "Bagel", priceIncrease: null },
        { id: "brkBr2", label: "English Muffin", priceIncrease: null },
        { id: "brkBr3", label: "Croissant", priceIncrease: "0.50" },
        { id: "brkBr4", label: "Wrap", priceIncrease: null },
      ],
    },
    {
      id: "brkEgg1", label: "Egg Style", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "brkEg1", label: "Scrambled", priceIncrease: null },
        { id: "brkEg2", label: "Fried", priceIncrease: null },
        { id: "brkEg3", label: "Egg White", priceIncrease: null },
      ],
    },
    {
      id: "brkMeat1", label: "Meat", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "brkMt1", label: "Bacon", priceIncrease: "1.50" },
        { id: "brkMt2", label: "Sausage", priceIncrease: "1.50" },
        { id: "brkMt3", label: "Ham", priceIncrease: "1.50" },
        { id: "brkMt4", label: "Turkey Bacon", priceIncrease: "1.50" },
        { id: "brkMt5", label: "No Meat", priceIncrease: null },
      ],
    },
    {
      id: "brkCheese1", label: "Cheese", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "brkCh1", label: "American", priceIncrease: null },
        { id: "brkCh2", label: "Cheddar", priceIncrease: null },
        { id: "brkCh3", label: "Swiss", priceIncrease: null },
        { id: "brkCh4", label: "No Cheese", priceIncrease: null },
      ],
    },
  ],
};

// ===== SIDES =====

const FriesTemplate = {
  id: "templateFries001",
  name: "Fries",
  description: "Crispy fries with optional toppings",
  category: "Sides",
  price: "4.49",
  options: [
    {
      id: "frySize1", label: "Size", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      defaultValue: { label: "Regular", id: "frySz1", priceIncrease: null },
      optionsList: [
        { id: "frySz1", label: "Regular", priceIncrease: null, selected: true },
        { id: "frySz2", label: "Large", priceIncrease: "1.50" },
      ],
    },
    {
      id: "fryStyle1", label: "Style", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "frySt1", label: "Classic", priceIncrease: null },
        { id: "frySt2", label: "Curly", priceIncrease: "0.50" },
        { id: "frySt3", label: "Sweet Potato", priceIncrease: "1.00" },
        { id: "frySt4", label: "Loaded", priceIncrease: "2.50" },
      ],
    },
  ],
};

// ===== DESSERTS =====

const MilkshakeTemplate = {
  id: "templateShake001",
  name: "Milkshake",
  description: "Thick and creamy milkshake",
  category: "Desserts",
  price: "6.99",
  options: [
    {
      id: "shakeFlav1", label: "Flavor", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "shFl1", label: "Chocolate", priceIncrease: null },
        { id: "shFl2", label: "Vanilla", priceIncrease: null },
        { id: "shFl3", label: "Strawberry", priceIncrease: null },
        { id: "shFl4", label: "Cookies & Cream", priceIncrease: "0.50" },
        { id: "shFl5", label: "Peanut Butter", priceIncrease: "0.50" },
      ],
    },
    {
      id: "shakeTop1", label: "Toppings", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: null, selectedCaseList: [],
      optionsList: [
        { id: "shTp1", label: "Whipped Cream", priceIncrease: null },
        { id: "shTp2", label: "Sprinkles", priceIncrease: "0.25" },
        { id: "shTp3", label: "Cherry", priceIncrease: null },
        { id: "shTp4", label: "Extra Thick", priceIncrease: "0.50" },
      ],
    },
  ],
};

// ===== BOWLS =====

const PokeBowlTemplate = {
  id: "templatePoke001",
  name: "Poke Bowl",
  description: "Build your own poke bowl with fresh ingredients",
  category: "Bowls",
  price: "13.99",
  options: [
    {
      id: "pokeBase1", label: "Base", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "pokBs1", label: "Sushi Rice", priceIncrease: null },
        { id: "pokBs2", label: "Brown Rice", priceIncrease: null },
        { id: "pokBs3", label: "Mixed Greens", priceIncrease: null },
        { id: "pokBs4", label: "Half & Half", priceIncrease: null },
      ],
    },
    {
      id: "pokeProt1", label: "Protein", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "pokPr1", label: "Salmon", priceIncrease: null },
        { id: "pokPr2", label: "Tuna", priceIncrease: null },
        { id: "pokPr3", label: "Shrimp", priceIncrease: null },
        { id: "pokPr4", label: "Tofu", priceIncrease: "-1.00" },
        { id: "pokPr5", label: "Chicken", priceIncrease: "-1.00" },
      ],
    },
    {
      id: "pokeTop1", label: "Toppings", optionType: "Quantity Dropdown", isRequired: false,
      numOfSelectable: "6", selectedCaseList: [],
      optionsList: [
        { id: "pokTp1", label: "Avocado", priceIncrease: null },
        { id: "pokTp2", label: "Edamame", priceIncrease: null },
        { id: "pokTp3", label: "Cucumber", priceIncrease: null },
        { id: "pokTp4", label: "Seaweed", priceIncrease: null },
        { id: "pokTp5", label: "Mango", priceIncrease: null },
        { id: "pokTp6", label: "Corn", priceIncrease: null },
        { id: "pokTp7", label: "Crispy Onion", priceIncrease: null },
        { id: "pokTp8", label: "Masago", priceIncrease: "1.00" },
      ],
    },
    {
      id: "pokeSauce1", label: "Sauce", optionType: "Row", isRequired: false,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "pokSc1", label: "Soy Sauce", priceIncrease: null },
        { id: "pokSc2", label: "Spicy Mayo", priceIncrease: null },
        { id: "pokSc3", label: "Ponzu", priceIncrease: null },
        { id: "pokSc4", label: "Sesame", priceIncrease: null },
      ],
    },
  ],
};

// ===== SIMPLE ITEMS (no options) =====

const WaterTemplate = {
  id: "templateWater001",
  name: "Bottled Water",
  description: "500ml bottled water",
  category: "Simple Items",
  price: "1.99",
  options: [],
};

const CookieTemplate = {
  id: "templateCookie001",
  name: "Cookie",
  description: "Freshly baked cookie",
  category: "Simple Items",
  price: "2.49",
  options: [
    {
      id: "cookFlav1", label: "Flavor", optionType: "Row", isRequired: true,
      numOfSelectable: "1", selectedCaseList: [],
      optionsList: [
        { id: "ckFl1", label: "Chocolate Chip", priceIncrease: null },
        { id: "ckFl2", label: "Double Chocolate", priceIncrease: null },
        { id: "ckFl3", label: "Oatmeal Raisin", priceIncrease: null },
        { id: "ckFl4", label: "Macadamia Nut", priceIncrease: "0.50" },
      ],
    },
  ],
};

const productTemplateCatalog = {
  products: [
    BuildYourOwnPizza,
    DoublePizzaCombo,
    CoffeeTemplate,
    IcedLatteTemplate,
    SmoothieTemplate,
    ClassicBurgerTemplate,
    SubSandwichTemplate,
    SaladTemplate,
    BreakfastSandwichTemplate,
    FriesTemplate,
    MilkshakeTemplate,
    PokeBowlTemplate,
    WaterTemplate,
    CookieTemplate,
  ],
  categories: [
    "Pizza",
    "Combos",
    "Coffee & Drinks",
    "Burgers",
    "Sandwiches",
    "Salads",
    "Breakfast",
    "Sides",
    "Desserts",
    "Bowls",
    "Simple Items",
  ],
};

export default productTemplateCatalog;
