const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchReport(
  from_date,
  to_date,
  useStartDate,
  useProvider,
  selectedProvider,
  usePolicyType,
  selectedType,
  usePolicyCategory,
  selectedCategory,
  useVehicleType,
  selectedVehicleType,
  callback
) {
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
       CASE WHEN Vehicles.vehicle_id IS NULL THEN Policies.coverage_details ELSE COALESCE(VehicleMakes.make_name, '') || ' ' || COALESCE(VehicleModels.model_name, '') || ' ' || COALESCE(Vehicles.year_built, '') || ' ' || Vehicles.plate_number  END AS Coverage_info,
       Policies.active_status,
       Vehicles.type_id,
       VehicleTypes.type_name AS vehicle_type_name,
       Policies.vehicle_id,
       CASE WHEN Vehicles.type_id IS NULL THEN PolicyTypes.type_name || ' - ' || PolicyCategories.category_name ELSE PolicyTypes.type_name || ' - ' || PolicyCategories.category_name || ' - ' || VehicleTypes.type_name END AS policy_info
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
       LEFT JOIN
       Vehicles ON Policies.vehicle_id = Vehicles.vehicle_id
       LEFT JOIN
       VehicleMakes ON Vehicles.make_id = VehicleMakes.make_id
       LEFT JOIN
       VehicleModels ON Vehicles.model_id = VehicleModels.model_id
       LEFT JOIN
       VehicleTypes ON Vehicles.type_id = VehicleTypes.type_id
    WHERE Policies.active_status != 0 
      AND ${useStartDate ? "Policies.from_date" : "Policies.to_date"} >= ?
      AND ${useStartDate ? "Policies.from_date" : "Policies.to_date"} <= ?
      ${useProvider ? "AND Policies.provider_id = ?" : ""}
      ${usePolicyType ? "AND Policies.type_id = ?" : ""}
      ${usePolicyCategory ? "AND Policies.category_id = ?" : ""}
      ${useVehicleType ? "AND Vehicles.type_id = ?" : ""}
    ORDER BY ${useStartDate ? "Policies.from_date ASC" : "Policies.to_date ASC"}
  `;

  const params = [from_date, to_date];

  if (useProvider) {
    params.push(selectedProvider.provider_id);
  }

  if (usePolicyType) {
    params.push(selectedType.type_id);
  }

  if (usePolicyCategory) {
    params.push(selectedCategory.category_id);
  }

  if (useVehicleType) {
    params.push(selectedVehicleType.type_id);
  }

  // console.log("query: ", query);
  // console.log("params: ", params);

  // Assuming `db` is your database connection or client
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      callback(err, []);
      return;
    }
    callback(null, rows);
  });
}

module.exports = {
  fetchReport,
};
