const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchCategories(callback) {
  const query = `
    SELECT pc.*, pt.type_name
    FROM PolicyCategories pc
    JOIN PolicyTypes pt ON pc.type_id = pt.type_id
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function addCategory(category, callback) {
  const query = `
    INSERT INTO PolicyCategories (category_name, type_id)
    VALUES (?, ?)
  `;
  db.run(query, [category.category_name, category.type_id], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback("failure");
      return;
    }
    callback("success");
  });
}

function editCategory(category, callback) {
  const query = `
    UPDATE PolicyCategories
    SET category_name = ?, type_id = ?
    WHERE category_id = ?
  `;
  db.run(
    query,
    [category.category_name, category.type_id, category.category_id],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        callback("failure");
        return;
      }
      callback("success");
    }
  );
}

function deleteCategory(categoryId, callback) {
  const query = `
    DELETE FROM PolicyCategories
    WHERE category_id = ?
  `;
  db.run(query, [categoryId], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback("failure");
      return;
    }
    callback("success");
  });
}

module.exports = {
  fetchCategories,
  addCategory,
  editCategory,
  deleteCategory,
};
