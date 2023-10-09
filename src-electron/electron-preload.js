/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  authenticateUser: (username, password) =>
    ipcRenderer.invoke("authenticate-user", username, password),
  //Clients
  fetchClients: () => ipcRenderer.invoke("fetch-clients"),
  addClient: (clientData) => {
    return ipcRenderer.invoke("add-client", clientData);
  },
  editClient: (clientData) => ipcRenderer.invoke("edit-client", clientData),
  deleteClient: (clientId) => ipcRenderer.invoke("delete-client", clientId),
  //Users
  fetchUsers: () => ipcRenderer.invoke("fetch-users"),
  addUser: (userData) => {
    return ipcRenderer.invoke("add-user", userData);
  },
  editUser: (userData) => ipcRenderer.invoke("edit-user", userData),
  deleteUser: (userId) => ipcRenderer.invoke("delete-user", userId),
  //Policies
  fetchPolicies: () => ipcRenderer.invoke("fetch-policies"),
  fetchSubCategories: (typeId) =>
    ipcRenderer.invoke("fetch-sub-categories", typeId),
  fetchVehicleDetails: (clientId) =>
    ipcRenderer.invoke("fetch-vehicle-details", clientId),
  fetchPolicyById: (policyId) =>
    ipcRenderer.invoke("fetch-policy-by-id", policyId),
  checkPolicyNumberExists: (policyNumber) =>
    ipcRenderer.invoke("check-policy-number-exists", policyNumber),
  addPolicy: (policyData) => ipcRenderer.invoke("add-policy", policyData),
  editPolicy: (policyData) => ipcRenderer.invoke("edit-policy", policyData),
  renewPolicy: (policyData) => ipcRenderer.invoke("renew-policy", policyData),
  deletePolicy: (policyId) => ipcRenderer.invoke("delete-policy", policyId),
  //PolicyTypes
  fetchPolicyTypes: () => ipcRenderer.invoke("fetch-policy-types"),
  addPolicyType: (typeData) => ipcRenderer.invoke("add-policy-type", typeData),
  editPolicyType: (typeData) =>
    ipcRenderer.invoke("edit-policy-type", typeData),
  deletePolicyType: (typeId) =>
    ipcRenderer.invoke("delete-policy-type", typeId),
  // Insurance Providers
  fetchProviders: () => ipcRenderer.invoke("fetch-providers"),
  addProvider: (providerData) =>
    ipcRenderer.invoke("add-provider", providerData),
  editProvider: (providerData) =>
    ipcRenderer.invoke("edit-provider", providerData),
  deleteProvider: (providerId) =>
    ipcRenderer.invoke("delete-provider", providerId),
  //Policy categories
  fetchCategories: () => ipcRenderer.invoke("fetch-categories"),
  addCategory: (category) => ipcRenderer.invoke("add-category", category),
  editCategory: (category) => ipcRenderer.invoke("edit-category", category),
  deleteCategory: (categoryId) =>
    ipcRenderer.invoke("delete-category", categoryId),
  // Vehicles
  fetchModels: (makeId) => ipcRenderer.invoke("fetch-models", makeId),
  fetchTypes: () => ipcRenderer.invoke("fetch-types"),
  fetchVehicles: () => ipcRenderer.invoke("fetch-vehicles"),
  addVehicle: (vehicle) => ipcRenderer.invoke("add-vehicle", vehicle),
  editVehicle: (vehicle) => ipcRenderer.invoke("edit-vehicle", vehicle),
  deleteVehicle: (plateNumber) =>
    ipcRenderer.invoke("delete-vehicle", plateNumber),
  fetchClientsFullName: () => ipcRenderer.invoke("fetch-clients-full-name"),
  // Vehicle Makes
  fetchVehicleMakes: () => ipcRenderer.invoke("fetch-vehicle-makes"),
  addVehicleMake: (make) => ipcRenderer.invoke("add-vehicle-make", make),
  editVehicleMake: (make) => ipcRenderer.invoke("edit-vehicle-make", make),
  deleteVehicleMake: (makeId) =>
    ipcRenderer.invoke("delete-vehicle-make", makeId),
  // Vehicle Models
  fetchVehicleModels: () => ipcRenderer.invoke("fetch-vehicle-models"),
  addVehicleModel: (model) => ipcRenderer.invoke("add-vehicle-model", model),
  editVehicleModel: (model) => ipcRenderer.invoke("edit-vehicle-model", model),
  deleteVehicleModel: (modelId) =>
    ipcRenderer.invoke("delete-vehicle-model", modelId),
  // Vehicle Types
  fetchVehicleTypes: () => ipcRenderer.invoke("fetch-vehicle-types"),
  addVehicleType: (type) => ipcRenderer.invoke("add-vehicle-type", type),
  editVehicleType: (type) => ipcRenderer.invoke("edit-vehicle-type", type),
  deleteVehicleType: (typeId) =>
    ipcRenderer.invoke("delete-vehicle-type", typeId),
  // Vehicle Usage
  fetchVehicleUsages: () => ipcRenderer.invoke("fetch-vehicle-usages"),
  addVehicleUsage: (usage) => ipcRenderer.invoke("add-vehicle-usage", usage),
  editVehicleUsage: (usage) => ipcRenderer.invoke("edit-vehicle-usage", usage),
  deleteVehicleUsage: (usageId) =>
    ipcRenderer.invoke("delete-vehicle-usage", usageId),
  fetchFirstUsage: () => ipcRenderer.invoke("fetch-first-usage"),
  // Brokers
  fetchBrokers: () => ipcRenderer.invoke("fetch-brokers"),
  addBroker: (broker) => ipcRenderer.invoke("add-broker", broker),
  editBroker: (broker) => ipcRenderer.invoke("edit-broker", broker),
  deleteBroker: (brokerId) => ipcRenderer.invoke("delete-broker", brokerId),
  //Reports
  fetchReport: (params) => ipcRenderer.invoke("fetch-report", params),
});

// console.log("Preload script loaded!");
