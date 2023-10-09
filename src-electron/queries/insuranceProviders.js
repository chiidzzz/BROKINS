const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchProviders(callback) {
  db.all("SELECT * FROM InsuranceProviders", [], (err, rows) => {
    if (err) {
      console.error(err);
      callback(null);
      return;
    }
    callback(rows);
  });
}

function addProvider(provider, callback) {
  const { provider_name, contact_number, contact_email } = provider;
  db.run(
    "INSERT INTO InsuranceProviders (provider_name, contact_number, contact_email) VALUES (?, ?, ?)",
    [provider_name, contact_number, contact_email],
    function (err) {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      callback(true);
    }
  );
}

function editProvider(provider, callback) {
  const { provider_id, provider_name, contact_number, contact_email } =
    provider;
  db.run(
    "UPDATE InsuranceProviders SET provider_name = ?, contact_number = ?, contact_email = ? WHERE provider_id = ?",
    [provider_name, contact_number, contact_email, provider_id],
    function (err) {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      callback(true);
    }
  );
}

function deleteProvider(providerId, callback) {
  db.run(
    "DELETE FROM InsuranceProviders WHERE provider_id = ?",
    [providerId],
    function (err) {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      callback(true);
    }
  );
}

module.exports = {
  fetchProviders,
  addProvider,
  editProvider,
  deleteProvider,
};
