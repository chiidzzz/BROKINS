const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchProviders(callback) {
  db.all(
    "SELECT provider_id, provider_name FROM InsuranceProviders",
    [],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        callback([]);
        return;
      }
      callback(rows);
    }
  );
}

function fetchSubCategories(typeId, callback) {
  db.all(
    "SELECT category_id, category_name FROM PolicyCategories WHERE type_id = ?",
    [typeId],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        callback([]);
        return;
      }
      callback(rows);
    }
  );
}

function fetchVehicleDetails(clientId, callback) {
  db.all(
    `SELECT Vehicles.vehicle_id,
       COALESCE(Vehicles.plate_number, '') || ' - ' || COALESCE(VehicleMakes.make_name, '') || ' ' || COALESCE(VehicleModels.model_name, '') || ' ' || COALESCE(Vehicles.year_built, '') AS vehicle_details,
       Vehicles.reference_name
    FROM Vehicles
       LEFT JOIN
       VehicleMakes ON Vehicles.make_id = VehicleMakes.make_id
       LEFT JOIN
       VehicleModels ON Vehicles.model_id = VehicleModels.model_id
    WHERE Vehicles.client_id = ?`,
    [clientId],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        callback([]);
        return;
      }

      callback(rows);
    }
  );
}

function fetchPolicies(callback) {
  const query = `
SELECT Policies.policy_id,
       Policies.policy_number,
       Policies.client_id,
       Clients.first_name || ' ' || COALESCE(Clients.middle_name, '') || ' ' || COALESCE(Clients.last_name, '') AS client_name,
       Policies.reference_name,
       Policies.type_id,
       PolicyTypes.type_name,
       Policies.category_id,
       PolicyCategories.category_name,
       VehicleTypes.type_name AS vehicle_type_name,
       Policies.vehicle_id,
       (
           SELECT Vehicles.plate_number || ' - ' || COALESCE(VehicleMakes.make_name, '') || ' ' || COALESCE(VehicleModels.model_name, '') || ' ' || COALESCE(Vehicles.year_built, '') 
             FROM Vehicles
                  LEFT JOIN
                  VehicleMakes ON Vehicles.make_id = VehicleMakes.make_id
                  LEFT JOIN
                  VehicleModels ON Vehicles.model_id = VehicleModels.model_id
            WHERE Vehicles.vehicle_id = Policies.vehicle_id
       )
       AS vehicle_details,
       Policies.broker_id,
       Brokers.broker_name,
       Policies.provider_id,
       InsuranceProviders.provider_name,
       Policies.total_premium,
       Policies.net_premium,
       Policies.company_comm,
       Policies.broker_comm,
       Policies.from_date,
       Policies.to_date,
       Policies.coverage_details,
       Policies.active_status
  FROM Policies
       LEFT JOIN
       Clients ON Policies.client_id = Clients.client_id
       LEFT JOIN
       PolicyTypes ON Policies.type_id = PolicyTypes.type_id
       LEFT JOIN
       PolicyCategories ON Policies.category_id = PolicyCategories.category_id
       LEFT JOIN
       Brokers ON Policies.broker_id = Brokers.broker_id
       LEFT JOIN
       InsuranceProviders ON Policies.provider_id = InsuranceProviders.provider_id
       LEFT JOIN Vehicles ON Policies.vehicle_id = Vehicles.vehicle_id
       LEFT JOIN VehicleTypes ON Vehicles.type_id = VehicleTypes.type_id
 WHERE Policies.active_status != 0;
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

function fetchPolicyById(policyId, callback) {
  const query = `
SELECT Policies.policy_id,
       Policies.policy_number,
       Policies.client_id,
       Clients.first_name || ' ' || COALESCE(Clients.middle_name, '') || ' ' || COALESCE(Clients.last_name, '') AS client_name,
       Policies.reference_name,
       Policies.type_id,
       PolicyTypes.type_name,
       Policies.category_id,
       PolicyCategories.category_name,
       Policies.vehicle_id,
       (
           SELECT Vehicles.plate_number || ' - ' || COALESCE(VehicleMakes.make_name, '') || ' ' || COALESCE(VehicleModels.model_name, '') || ' ' || COALESCE(Vehicles.year_built, '') 
             FROM Vehicles
                  LEFT JOIN
                  VehicleMakes ON Vehicles.make_id = VehicleMakes.make_id
                  LEFT JOIN
                  VehicleModels ON Vehicles.model_id = VehicleModels.model_id
            WHERE Vehicles.vehicle_id = Policies.vehicle_id
       )
       AS vehicle_details,
       Policies.broker_id,
       Brokers.broker_name,
       Policies.provider_id,
       InsuranceProviders.provider_name,
       Policies.total_premium,
       Policies.net_premium,
       Policies.company_comm,
       Policies.broker_comm,
       Policies.from_date,
       Policies.to_date,
       Policies.coverage_details,
       Policies.active_status
  FROM Policies
       LEFT JOIN
       Clients ON Policies.client_id = Clients.client_id
       LEFT JOIN
       PolicyTypes ON Policies.type_id = PolicyTypes.type_id
       LEFT JOIN
       PolicyCategories ON Policies.category_id = PolicyCategories.category_id
       LEFT JOIN
       Brokers ON Policies.broker_id = Brokers.broker_id
       LEFT JOIN
       InsuranceProviders ON Policies.provider_id = InsuranceProviders.provider_id
 WHERE Policies.active_status != 0 AND 
       Policies.policy_id = ?;
  `;

  db.get(query, [policyId], (err, row) => {
    if (err) {
      callback(err);
    } else {
      callback(null, row);
    }
  });
}

function checkPolicyNumberExists(policy_number, callback) {
  db.get(
    "SELECT policy_number FROM Policies WHERE Policies.active_status != 0 AND policy_number = ?",
    [policy_number],
    (err, row) => {
      if (err) {
        console.error("Error checking policy number:", err);
        callback(err, null);
        return;
      }
      const exists = !!row;
      callback(null, exists);
    }
  );
}

function addPolicy(policy, callback) {
  const {
    policy_number,
    client_id,
    reference_name,
    type_id,
    category_id,
    vehicle_id,
    total_premium,
    net_premium,
    company_comm,
    broker_comm,
    from_date,
    to_date,
    broker_id,
    provider_id,
    coverage_details,
    data_saved_by,
    active_status,
  } = policy;

  // First, check if the policy number already exists
  checkPolicyNumberExists(policy_number, (err, exists) => {
    if (err) {
      console.error("Database error:", err);
      callback({ success: false, message: "Failed to check policy number." });
      return;
    }
    if (exists) {
      callback({ success: false, message: "Policy number is duplicated." });
      return;
    }
    // If policy number doesn't exist, proceed with adding the policy
    const stmt = db.prepare(
      `INSERT INTO Policies (
       policy_number, 
       client_id,
       reference_name,
       type_id,
       category_id,
       vehicle_id,
       total_premium,
       net_premium,
       company_comm,
       broker_comm,
       from_date,
       to_date,
       broker_id,
       provider_id,
       coverage_details,
       data_saved_by,
       active_status
     ) VALUES (
       ?, 
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?,
       ?
     )`
    );
    stmt.run(
      [
        policy_number,
        client_id,
        reference_name,
        type_id,
        category_id || null,
        vehicle_id || null,
        total_premium,
        net_premium,
        company_comm,
        broker_comm,
        from_date,
        to_date,
        broker_id,
        provider_id,
        coverage_details,
        data_saved_by,
        active_status, // 1 for add, 3 for renew, 4 for endorsement
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          callback({ success: false, message: "Failed to add policy." });
          return;
        }

        callback({ success: true, message: "Policy added successfully." });
      }
    );
  });
}

function editPolicy(policy, callback) {
  const {
    policy_id,
    policy_number,
    client_id,
    reference_name,
    type_id,
    category_id,
    vehicle_id,
    total_premium,
    net_premium,
    company_comm,
    broker_comm,
    from_date,
    to_date,
    broker_id,
    provider_id,
    coverage_details,
    data_saved_by,
    active_status,
  } = policy;
  const stmt = db.prepare(
    `UPDATE Policies SET
      policy_number = ?,
      client_id = ?,
      reference_name = ?,
      type_id = ?,
      category_id = ?, 
      vehicle_id = ?,
      total_premium = ?,
      net_premium = ?,
      company_comm = ?,
      broker_comm = ?,
      from_date = ?,
      to_date = ?,
      broker_id = ?,
      provider_id = ?,
      coverage_details = ?,
      data_saved_by = ?,
      active_status = ?
     WHERE policy_id = ?`
  );
  stmt.run(
    [
      policy_number,
      client_id,
      reference_name,
      type_id,
      category_id,
      vehicle_id,
      total_premium,
      net_premium,
      company_comm,
      broker_comm,
      from_date,
      to_date,
      broker_id,
      provider_id,
      coverage_details,
      data_saved_by,
      active_status, // 2 for edit
      policy_id,
    ],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        callback(false);
        return;
      }
      callback(true);
    }
  );
}

function deletePolicy(policyId, callback) {
  const stmt = db.prepare(
    "UPDATE Policies SET active_status = ? WHERE policy_id = ?"
  );
  stmt.run([0, policyId], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback(false);
      return;
    }
    callback(true);
  });
}

module.exports = {
  fetchPolicies,
  fetchProviders,
  fetchVehicleDetails,
  fetchSubCategories,
  addPolicy,
  editPolicy,
  deletePolicy,
  fetchPolicyById,
  checkPolicyNumberExists,
};
