const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchPolicyTypes(callback) {
  db.all("SELECT * FROM PolicyTypes", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

function addPolicyType(type, callback) {
  const stmt = db.prepare("INSERT INTO PolicyTypes (type_name) VALUES (?)");
  stmt.run([type.type_name], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function editPolicyType(type, callback) {
  const stmt = db.prepare(
    "UPDATE PolicyTypes SET type_name = ? WHERE type_id = ?"
  );
  stmt.run([type.type_name, type.type_id], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function deletePolicyType(typeId, callback) {
  const stmt = db.prepare("DELETE FROM PolicyTypes WHERE type_id = ?");
  stmt.run([typeId], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

module.exports = {
  fetchPolicyTypes,
  addPolicyType,
  editPolicyType,
  deletePolicyType,
};
