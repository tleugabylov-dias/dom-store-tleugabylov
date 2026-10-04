class Store {
  #items = [];

  constructor(items = []) {
    items.forEach((item) => this.add(item));
  }

  static isValidItem(item) {
    return (
      item !== null &&
      typeof item === "object" &&
      typeof item.name === "string" &&
      item.name.trim() !== "" &&
      Number.isFinite(item.price) &&
      item.price > 0 &&
      Number.isInteger(item.qty) &&
      item.qty >= 0
    );
  }

  get items() {
    return this.#items.map((item) => ({ ...item }));
  }

  add(item) {
    if (!Store.isValidItem(item)) {
      throw new TypeError("Invalid product");
    }

    const name = item.name.trim();
    const existingItem = this.#items.find(
      (product) => product.name === name
    );

    if (existingItem) {
      existingItem.qty += item.qty;
    } else {
      this.#items.push({ ...item, name });
    }

    return this;
  }

  remove(name) {
    const previousLength = this.#items.length;

    this.#items = this.#items.filter((item) => item.name !== name);

    return this.#items.length < previousLength;
  }

  find(name) {
    const item = this.#items.find((item) => item.name === name);
    return item ? { ...item } : undefined;
  }

  updateQty(name, qty) {
    if (!Number.isInteger(qty) || qty < 0) {
      throw new TypeError("Quantity must be a non-negative integer");
    }

    const item = this.#items.find((item) => item.name === name);

    if (!item) {
      return false;
    }

    item.qty = qty;
    return true;
  }

  total() {
    return this.#items.reduce(
      (sum, { price, qty }) => sum + price * qty,
      0
    );
  }

  list() {
    return this.items;
  }
}