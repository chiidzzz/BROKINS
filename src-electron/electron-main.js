import { app, BrowserWindow, nativeTheme, ipcMain, Menu } from "electron";
import path from "path";
import os from "os";
import db from "./queries/users.js";

const platform = process.platform || os.platform();

try {
  if (platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    require("fs").unlinkSync(
      path.join(app.getPath("userData"), "DevTools Extensions")
    );
  }
} catch (_) {}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"),
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

//Login
import users from "./queries/users.js";
ipcMain.handle("authenticate-user", async (event, username, password) => {
  return new Promise((resolve, reject) => {
    users.authenticateUser(username, password, (result) => {
      if (result && result.isAuthenticated) {
        resolve(result); // result contains both isAuthenticated and role
      } else {
        reject(new Error("Authentication failed"));
      }
    });
  });
});

//Clients
import clients from "./queries/clients.js";
ipcMain.handle("fetch-clients", async () => {
  return new Promise((resolve, reject) => {
    clients.fetchClients((data) => {
      // Use clients instead of db
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Failed to fetch clients"));
      }
    });
  });
});

ipcMain.handle("add-client", async (event, client) => {
  return new Promise((resolve, reject) => {
    clients.addClient(client, (result) => {
      // Use clients instead of db
      if (result) {
        resolve("success");
      } else {
        reject("Failed to add client");
      }
    });
  });
});

ipcMain.handle("edit-client", async (event, client) => {
  return new Promise((resolve, reject) => {
    clients.editClient(client, (result) => {
      // Use clients instead of db
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to edit client"));
      }
    });
  });
});

ipcMain.handle("delete-client", async (event, clientId) => {
  return new Promise((resolve, reject) => {
    clients.deleteClient(clientId, (result) => {
      // Use clients instead of db
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to delete client"));
      }
    });
  });
});

//Users
//import already defined
ipcMain.handle("fetch-users", async () => {
  return new Promise((resolve, reject) => {
    db.fetchUsers((data) => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Failed to fetch users"));
      }
    });
  });
});

ipcMain.handle("add-user", async (event, user) => {
  return new Promise((resolve, reject) => {
    db.addUser(user, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject("Failed to add user");
      }
    });
  });
});

ipcMain.handle("edit-user", async (event, user) => {
  return new Promise((resolve, reject) => {
    db.editUser(user, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to edit user"));
      }
    });
  });
});

ipcMain.handle("delete-user", async (event, userId) => {
  return new Promise((resolve, reject) => {
    db.deleteUser(userId, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to delete user"));
      }
    });
  });
});

// Policies
import policies from "./queries/policies";

ipcMain.handle("fetch-policies", async () => {
  return new Promise((resolve, reject) => {
    policies.fetchPolicies((data) => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Failed to fetch policies"));
      }
    });
  });
});

ipcMain.handle("fetch-sub-categories", async (event, typeId) => {
  return new Promise((resolve, reject) => {
    policies.fetchSubCategories(typeId, (result) => {
      // console.log("Result from fetchSubCategories:", result);
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to fetch subcategories"));
      }
    });
  });
});

ipcMain.handle("fetch-vehicle-details", async (event, clientId) => {
  return new Promise((resolve, reject) => {
    policies.fetchVehicleDetails(clientId, (result) => {
      // console.log("Result from fetchVehicleeDetails:", result);
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to fetch vehicle details"));
      }
    });
  });
});

ipcMain.handle("fetch-policy-by-id", async (event, policyId) => {
  return new Promise((resolve, reject) => {
    policies.fetchPolicyById(policyId, (err, policy) => {
      if (err) {
        reject(err);
      } else {
        resolve(policy);
      }
    });
  });
});

ipcMain.handle("check-policy-number-exists", async (event, policy_number) => {
  return new Promise((resolve, reject) => {
    policies.checkPolicyNumberExists(policy_number, (err, exists) => {
      if (err) {
        reject("Failed to check policy number");
        return;
      }
      resolve(exists);
    });
  });
});

ipcMain.handle("add-policy", async (event, policy) => {
  return new Promise((resolve, reject) => {
    policies.addPolicy(policy, (result) => {
      if (result) {
        resolve("success");
        // console.log("sending policy:", policy);
      } else {
        reject("Failed to add policy");
      }
    });
  });
});

ipcMain.handle("edit-policy", async (event, policy) => {
  return new Promise((resolve, reject) => {
    policies.editPolicy(policy, (result) => {
      if (result) {
        resolve("success");
        // console.log(result);
        // console.log("sending policy:", policy);
      } else {
        reject(new Error("Failed to edit policy"));
      }
    });
  });
});

ipcMain.handle("delete-policy", async (event, policyId) => {
  return new Promise((resolve, reject) => {
    policies.deletePolicy(policyId, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to delete policy"));
      }
    });
  });
});

ipcMain.handle("renew-policy", async (event, policyId) => {
  return new Promise((resolve, reject) => {
    policies.renewPolicy(policyId, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to renew policy"));
      }
    });
  });
});

// Policy Types
import policyTypes from "./queries/policyTypes.js";

ipcMain.handle("fetch-policy-types", async () => {
  return new Promise((resolve, reject) => {
    policyTypes.fetchPolicyTypes((err, data) => {
      if (err) {
        reject(new Error("Failed to fetch policy types"));
      } else {
        resolve(data);
      }
    });
  });
});

ipcMain.handle("add-policy-type", async (event, type) => {
  return new Promise((resolve, reject) => {
    policyTypes.addPolicyType(type, (err, result) => {
      if (err) {
        reject("Failed to add policy type");
      } else {
        resolve("success");
      }
    });
  });
});

ipcMain.handle("edit-policy-type", async (event, type) => {
  return new Promise((resolve, reject) => {
    policyTypes.editPolicyType(type, (err, result) => {
      if (err) {
        reject(new Error("Failed to edit policy type"));
      } else {
        resolve("success");
      }
    });
  });
});

ipcMain.handle("delete-policy-type", async (event, typeId) => {
  return new Promise((resolve, reject) => {
    policyTypes.deletePolicyType(typeId, (err, result) => {
      if (err) {
        reject(new Error("Failed to delete policy type"));
      } else {
        resolve("success");
      }
    });
  });
});

// Insurance Providers
import insuranceProviders from "./queries/insuranceProviders.js";

ipcMain.handle("fetch-providers", async () => {
  return new Promise((resolve, reject) => {
    insuranceProviders.fetchProviders((data) => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Failed to fetch providers"));
      }
    });
  });
});

ipcMain.handle("add-provider", async (event, provider) => {
  return new Promise((resolve, reject) => {
    insuranceProviders.addProvider(provider, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject("Failed to add provider");
      }
    });
  });
});

ipcMain.handle("edit-provider", async (event, provider) => {
  return new Promise((resolve, reject) => {
    insuranceProviders.editProvider(provider, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to edit provider"));
      }
    });
  });
});

ipcMain.handle("delete-provider", async (event, providerId) => {
  return new Promise((resolve, reject) => {
    insuranceProviders.deleteProvider(providerId, (result) => {
      if (result) {
        resolve("success");
      } else {
        reject(new Error("Failed to delete provider"));
      }
    });
  });
});

//Policy categories
import PolicyCategories from "./queries/policyCategories.js";

ipcMain.handle("fetch-categories", async () => {
  return new Promise((resolve, reject) => {
    PolicyCategories.fetchCategories((categories) => {
      resolve(categories);
    });
  });
});

ipcMain.handle("add-category", async (_, category) => {
  return new Promise((resolve, reject) => {
    PolicyCategories.addCategory(category, (result) => {
      resolve(result);
    });
  });
});

ipcMain.handle("edit-category", async (_, category) => {
  return new Promise((resolve, reject) => {
    PolicyCategories.editCategory(category, (result) => {
      resolve(result);
    });
  });
});

ipcMain.handle("delete-category", async (_, categoryId) => {
  return new Promise((resolve, reject) => {
    PolicyCategories.deleteCategory(categoryId, (result) => {
      resolve(result);
    });
  });
});

// Vehicle
import Vehicles from "./queries/vehicles.js";

ipcMain.handle("fetch-clients-full-name", async () => {
  return new Promise((resolve, reject) => {
    Vehicles.fetchClientsFullName((data) => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Failed to fetch clients full name"));
      }
    });
  });
});

ipcMain.handle("fetch-models", async (event, makeId) => {
  return new Promise((resolve, reject) => {
    Vehicles.fetchModels(makeId, (result) => {
      // console.log("Result from fetchModels:", result);
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to fetch models"));
      }
    });
  });
});

ipcMain.handle("fetch-types", async () => {
  return new Promise((resolve, reject) => {
    Vehicles.fetchTypes((data) => {
      if (data) resolve(data);
      else reject(new Error("Failed to fetch types"));
    });
  });
});

ipcMain.handle("fetch-vehicles", async () => {
  return new Promise((resolve, reject) => {
    Vehicles.fetchVehicles((vehicles) => {
      resolve(vehicles);
    });
  });
});

ipcMain.handle("add-vehicle", async (_, vehicle) => {
  return new Promise((resolve, reject) => {
    Vehicles.addVehicle(vehicle, (result) => {
      resolve(result);
    });
  });
});

ipcMain.handle("edit-vehicle", async (_, vehicle) => {
  return new Promise((resolve, reject) => {
    Vehicles.editVehicle(vehicle, (result) => {
      resolve(result);
    });
  });
});

ipcMain.handle("delete-vehicle", async (_, vehicleId) => {
  return new Promise((resolve, reject) => {
    Vehicles.deleteVehicle(vehicleId, (result) => {
      resolve(result);
    });
  });
});

// Vehicle Makes
import VehicleMake from "./queries/vehicleMake.js";

ipcMain.handle("fetch-vehicle-makes", async () => {
  return new Promise((resolve, reject) => {
    VehicleMake.fetchVehicleMakes((err, makes) => {
      if (err) {
        reject(err);
      } else {
        resolve(makes);
      }
    });
  });
});

ipcMain.handle("add-vehicle-make", async (_, make) => {
  return new Promise((resolve, reject) => {
    VehicleMake.addVehicleMake(make, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

ipcMain.handle("edit-vehicle-make", async (_, make) => {
  return new Promise((resolve, reject) => {
    VehicleMake.editVehicleMake(make, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

ipcMain.handle("delete-vehicle-make", async (_, makeId) => {
  return new Promise((resolve, reject) => {
    VehicleMake.deleteVehicleMake(makeId, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

// Vehicle Models
import VehicleModel from "./queries/vehicleModel.js";

ipcMain.handle("fetch-vehicle-models", async () => {
  return new Promise((resolve, reject) => {
    VehicleModel.fetchVehicleModels((models) => {
      resolve(models);
    });
  });
});

ipcMain.handle("add-vehicle-model", async (_, model) => {
  return new Promise((resolve, reject) => {
    VehicleModel.addVehicleModel(model, (result) => {
      resolve(result);
    });
  });
});

ipcMain.handle("edit-vehicle-model", async (_, model) => {
  return new Promise((resolve, reject) => {
    VehicleModel.editVehicleModel(model, (result) => {
      resolve(result);
    });
  });
});

ipcMain.handle("delete-vehicle-model", async (_, modelId) => {
  return new Promise((resolve, reject) => {
    VehicleModel.deleteVehicleModel(modelId, (result) => {
      resolve(result);
    });
  });
});

// Vehicle Types
import VehicleTypes from "./queries/vehicleType.js";

ipcMain.handle("fetch-vehicle-types", async () => {
  return new Promise((resolve, reject) => {
    VehicleTypes.fetchVehicleTypes((err, types) => {
      if (err) {
        reject(err);
      } else {
        resolve(types);
      }
    });
  });
});

ipcMain.handle("add-vehicle-type", async (_, type) => {
  return new Promise((resolve, reject) => {
    VehicleTypes.addVehicleType(type, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

ipcMain.handle("edit-vehicle-type", async (_, type) => {
  return new Promise((resolve, reject) => {
    VehicleTypes.editVehicleType(type, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

ipcMain.handle("delete-vehicle-type", async (_, typeId) => {
  return new Promise((resolve, reject) => {
    VehicleTypes.deleteVehicleType(typeId, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

// Vehicle Usage
import VehicleUsage from "./queries/vehicleUsage.js";
ipcMain.handle("fetch-vehicle-usages", async () => {
  return new Promise((resolve, reject) => {
    VehicleUsage.fetchVehicleUsages((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle("add-vehicle-usage", async (_, usage) => {
  return new Promise((resolve, reject) => {
    VehicleUsage.addVehicleUsage(usage, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle("edit-vehicle-usage", async (_, usage) => {
  return new Promise((resolve, reject) => {
    VehicleUsage.editVehicleUsage(usage, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle("delete-vehicle-usage", async (_, usageId) => {
  return new Promise((resolve, reject) => {
    VehicleUsage.deleteVehicleUsage(usageId, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
});

ipcMain.handle("fetch-first-usage", (event) => {
  return new Promise((resolve, reject) => {
    fetchFirstUsage((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
});

// Brokers
import Brokers from "./queries/brokers.js";

ipcMain.handle("fetch-brokers", async () => {
  return new Promise((resolve, reject) => {
    Brokers.fetchBrokers((err, brokers) => {
      if (err) {
        reject(err);
      } else {
        resolve(brokers);
      }
    });
  });
});

ipcMain.handle("add-broker", async (_, broker) => {
  return new Promise((resolve, reject) => {
    Brokers.addBroker(broker, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

ipcMain.handle("edit-broker", async (_, broker) => {
  return new Promise((resolve, reject) => {
    Brokers.editBroker(broker, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

ipcMain.handle("delete-broker", async (_, brokerId) => {
  return new Promise((resolve, reject) => {
    Brokers.deleteBroker(brokerId, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

//Reports
import Reports from "./queries/reports.js";

ipcMain.handle("fetch-report", async (_, params) => {
  return new Promise((resolve, reject) => {
    Reports.fetchReport(
      params.from_date,
      params.to_date,
      params.useStartDate,
      params.useProvider,
      params.selectedProvider,
      params.usePolicyType,
      params.selectedType,
      params.usePolicyCategory,
      params.selectedCategory,
      params.useVehicleType,
      params.selectedVehicleType,
      (err, rows) => {
        if (err) {
          console.error("Error within fetchReport function:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});
