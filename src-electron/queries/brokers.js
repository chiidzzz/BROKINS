const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the databasee
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchBrokers(callback) {
  db.all("SELECT * FROM Brokers", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

function addBroker(broker, callback) {
  const stmt = db.prepare(
    "INSERT INTO Brokers (broker_name, notes) VALUES (?, ?)"
  );
  stmt.run([broker.broker_name, broker.notes], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function editBroker(broker, callback) {
  const stmt = db.prepare(
    "UPDATE Brokers SET broker_name = ?, notes = ? WHERE broker_id = ?"
  );
  stmt.run(
    [broker.broker_name, broker.notes, broker.broker_id],
    function (err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, "success");
      }
    }
  );
}

function deleteBroker(brokerId, callback) {
  const stmt = db.prepare("DELETE FROM Brokers WHERE broker_id = ?");
  stmt.run([brokerId], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

module.exports = {
  fetchBrokers,
  addBroker,
  editBroker,
  deleteBroker,
};
