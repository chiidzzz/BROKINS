<template>
  <q-page padding>
    <q-table
      title="Policies List"
      dense
      :rows="policies"
      :columns="columns"
      row-key="policy_id"
      :pagination="{ rowsPerPage: 25 }"
      flat
      bordered
      grid-mode="full"
      :filter="filter"
      v-model:selected="selected"
    >
      <template v-slot:top-right>
        <q-input
          borderless
          dense
          filled
          debounce="300"
          v-model="filter"
          placeholder="Search"
          clearable
        >
        </q-input>
        <q-btn
          class="q-ml-md"
          color="primary"
          icon="add"
          label="Add Policy"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body="props">
        <q-tr @dblclick="editPolicy(props.row)" :props="props">
          <q-td key="actions" class="text-center">
            <div
              style="
                display: grid;
                grid-template-columns: repeat(
                  4,
                  1fr
                ); /* Creates 4 equally spaced columns */
                align-items: left;
                gap: 1px;
              "
            >
              <!-- Edit Button Container -->
              <div>
                <q-btn
                  padding="none"
                  icon="edit"
                  flat
                  no-caps
                  dense
                  @click="editPolicy(props.row)"
                >
                  <q-tooltip class="bg-info"> Edit Policy </q-tooltip>
                </q-btn>
              </div>

              <!-- Delete Button Container -->
              <div>
                <q-btn
                  padding="none"
                  flat
                  icon="delete_forever"
                  @click="deletePolicy(props.row)"
                >
                  <q-tooltip class="bg-negative"> Remove Policy </q-tooltip>
                </q-btn>
              </div>

              <!-- Renew Button Container -->
              <div>
                <q-btn
                  padding="none"
                  flat
                  icon="autorenew"
                  @click="renewPolicy(props.row)"
                >
                  <q-tooltip class="bg-positive"> Renew Policy </q-tooltip>
                </q-btn>
              </div>

              <!-- Endorse Button Container -->
              <div>
                <q-btn
                  v-if="
                    props.row.type_name === 'Auto' &&
                    ![0, 4].includes(props.row.active_status)
                  "
                  flat
                  padding="none"
                  icon="star"
                  @click="endorsePolicy(props.row)"
                >
                  <q-tooltip class="bg-secondary"> Endorse Policy </q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-td>
          <template v-for="col in props.cols">
            <q-td :key="col.name" :props="props" v-if="col.name !== 'actions'">
              {{ col.value }}
            </q-td>
          </template>
        </q-tr>
      </template>
    </q-table>

    <!-- Dialog for Add/Edit Policy -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 600px">
        <q-card-section>
          <div class="text-h6">
            {{
              isFormEndorsed
                ? "Endorse Policy"
                : isRenewing
                ? "Renew Policy"
                : isEditing
                ? "Edit Policy"
                : "Add New Policy"
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Fields -->
          <q-input
            outlined
            v-model="newPolicy.policy_number"
            label="Policy Number"
            clearable
          />
          <q-select
            outlined
            v-model="newPolicy.client_id"
            :options="clients"
            label="Client"
            option-value="client_id"
            option-label="client_name"
            use-input
            @filter="filterClients"
            clearable
          >
            <template v-slot:no-option>
              <q-btn flat @click="goToClientsTablePage">Add New Client</q-btn>
            </template>
          </q-select>
          <q-input
            outlined
            v-model="newPolicy.vehicle_id.reference_name"
            label="Reference"
            :readonly="true"
          />
          <q-select
            outlined
            :readonly="isFormEndorsed"
            v-model="newPolicy.type_id"
            :options="policyTypes"
            label="Policy Type"
            option-value="type_id"
            option-label="type_name"
            @update:model-value="togglePlateInfo"
          />
          <q-select
            outlined
            v-if="newPolicy.type_id.type_id == 2"
            v-model="newPolicy.vehicle_id"
            :options="vehicleDetails"
            label="Vehicle Info"
            option-value="value"
            option-label="label"
          >
            <template v-slot:append>
              <q-icon
                color="blue"
                name="electric_car"
                @click="goToVehiclesPage"
                style="margin-right: 15px"
              >
                <q-tooltip
                  class="bg-green"
                  anchor="center right"
                  self="center left"
                  :offset="[10, 10]"
                >
                  <strong>Add Vehicle</strong>
                </q-tooltip>
              </q-icon>
            </template>
          </q-select>

          <q-select
            outlined
            v-model="newPolicy.category_id"
            :options="categories"
            label="Policy Category"
            option-value="category_id"
            option-label="category_name"
          />

          <q-input
            outlined
            v-model="newPolicy.total_premium"
            label="Total Premium ($)"
            type="number"
          />
          <q-input
            outlined
            v-model="newPolicy.net_premium"
            label="Net Premium ($)"
            type="number"
          />
          <q-input
            outlined
            v-model="newPolicy.company_comm"
            label="Company Commission ($)"
            type="number"
            :readonly="true"
          />
          <q-input
            outlined
            v-model="newPolicy.broker_comm"
            label="Broker Commission ($)"
            type="number"
          />
          <q-input
            outlined
            v-model="newPolicy.from_date"
            label="Date From"
            type="date"
            @update:model-value="updateDateTo"
          />
          <q-input
            outlined
            v-model="newPolicy.to_date"
            label="Date To"
            type="date"
          />
          <q-select
            outlined
            v-model="newPolicy.broker_id"
            :options="brokers"
            label="Broker"
            option-value="broker_id"
            option-label="broker_name"
            emit-value
            map-options
          />
          <q-select
            outlined
            v-model="newPolicy.provider_id"
            :options="providers"
            label="Provider"
            option-value="provider_id"
            option-label="provider_name"
          />
          <q-input
            outlined
            v-model="newPolicy.coverage_details"
            label="Details"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Save" @click="addOrEditPolicy" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      filter: "",
      isFormInEditMode: false,
      isFormEndorsed: false,
      isRenewing: false,
      previousTypeId: null,
      previousClientId: null,
      clients: [],
      policies: [],
      providers: [],
      brokers: [],
      policyTypes: [],
      vehicleTypes: [],
      categories: [],
      vehicleDetails: [],
      columns: [
        {
          name: "actions",
          label: "ACTIONS BUTTONS",
          align: "left",
          field: (row) => row,
          sortable: false,
        },
        {
          name: "policy_id",
          label: "POLICY ID",
          align: "left",
          field: "policy_id",
          sortable: true,
        },
        {
          name: "policy_number",
          label: "POLICY NUMBER",
          align: "left",
          field: "policy_number",
          sortable: true,
        },
        {
          name: "insured_name",
          label: "CLIENT",
          align: "left",
          field: (row) => row.client_name,
          sortable: true,
        },
        {
          name: "reference_name",
          label: "REFERENCE",
          align: "left",
          field: "reference_name",
          sortable: true,
        },
        {
          name: "policy_type",
          label: "POLICY TYPE",
          align: "left",
          field: (row) => row.type_name,
          sortable: true,
        },
        {
          name: "policy_category",
          label: "POLICY CATEGORY",
          align: "left",
          field: (row) => row.category_name,
          sortable: true,
        },
        {
          name: "vehicle_type",
          label: "VEHICLE TYPE",
          align: "left",
          field: (row) => row.vehicle_type_name,
          sortable: true,
        },
        {
          name: "plate_number",
          label: "VEHICLE INFO",
          align: "left",
          field: (row) => row.vehicle_details,
          sortable: true,
        },
        {
          name: "total_premium",
          label: "TOTAL PREMIUM",
          align: "left",
          field: (row) => row.total_premium,
          sortable: true,
        },
        {
          name: "net_premium",
          label: "NET PREMIUM",
          align: "left",
          field: (row) => row.net_premium,
          sortable: true,
        },
        {
          name: "company_comm",
          label: "COMPANY COMM",
          align: "left",
          field: (row) => row.company_comm,
          sortable: true,
        },
        {
          name: "broker_comm",
          label: "BROKER COMM",
          align: "left",
          field: (row) => row.broker_comm,
          sortable: true,
        },
        {
          name: "date_from",
          label: "DATE FROM",
          align: "left",
          field: "from_date",
          sortable: true,
        },
        {
          name: "date_to",
          label: "DATE TO",
          align: "left",
          field: "to_date",
          sortable: true,
        },
        {
          name: "broker",
          label: "BROKER",
          align: "left",
          field: (row) => row.broker_name,
          sortable: true,
        },
        {
          name: "provider",
          label: "PROVIDER",
          align: "left",
          field: (row) => row.provider_name,
          sortable: true,
        },
        {
          name: "details",
          label: "DETAILS",
          align: "left",
          field: (row) => row.coverage_details,
          sortable: true,
        },
      ],
      newPolicy: {
        policy_number: "",
        client_id: "",
        type_id: "",
        reference_name: "",
        category_id: "",
        vehicle_id: "",
        total_premium: 0,
        net_premium: 0,
        company_comm: 0,
        broker_comm: 0,
        from_date: "",
        to_date: "",
        broker_id: "",
        provider_id: "",
        coverage_details: "",
        data_saved_by: "",
        active_status: "",
      },
      showForm: false,
      isEditing: false,
      policyToEdit: null,
      watchEnabled: true,
      policyBeforeEndorsement: null,
    };
  },

  beforeRouteLeave(to, from, next) {
    if (
      (to.name === "clients" && from.name === "policies") ||
      (to.name === "vehicles" && from.name === "policies")
    ) {
      sessionStorage.setItem(
        "tempPolicyFormData",
        JSON.stringify(this.newPolicy)
      );
      sessionStorage.setItem(
        "brokerInfo",
        JSON.stringify(this.newPolicy.broker_id)
      );
    }
    next();
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (
        (from.name === "vehicles" || from.name === "clients") &&
        to.name === "policies"
      ) {
        const initiatedFromAddPolicyForm = sessionStorage.getItem(
          "initiatedFromAddPolicyForm"
        );

        if (!initiatedFromAddPolicyForm) {
          return; // If not initiated from add policy form, do nothing
        }
        sessionStorage.removeItem("initiatedFromAddPolicyForm"); // Clear the stored flag

        const tempData = sessionStorage.getItem("tempPolicyFormData");
        if (tempData) {
          vm.newPolicy = JSON.parse(tempData);
          vm.newPolicy.type_id = { type_id: null, type_name: "" };
          sessionStorage.removeItem("tempPolicyFormData");
          vm.showAddForm();
        }
      }
    });
  },

  async created() {
    this.fetchPolicies();
    console.log("fetchPolicies : ", this.fetchPolicies());
    try {
      this.providers = await window.electron.fetchProviders();
      this.policyTypes = await window.electron.fetchPolicyTypes();
      this.categories = await window.electron.fetchSubCategories();
      this.vehicleTypes = await window.electron.fetchVehicleTypes();
      this.originalVehicleList = await window.electron.fetchClientsFullName();
      this.vehicle_ = [...this.originalVehicleList];
      this.brokers = await window.electron.fetchBrokers();
      this.vehicleDetails = await window.electron.fetchVehicleDetails();
    } catch (error) {
      console.error(
        "Failed to fetch providers, policy types, categories, clients, brokers, or vehicle types",
        error
      );
    }
    if (this.$route.query.showAddForm) {
      this.showAddForm();
    }
  },

  methods: {
    convertDateFormat(dateString) {
      if (dateString.includes("-")) {
        // Check if date is already in YYYY-MM-DD format
        return dateString;
      } else {
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    },
    updateDateTo() {
      const fromDate = new Date(this.newPolicy.from_date);
      const toDate = new Date(fromDate);
      toDate.setFullYear(fromDate.getFullYear() + 1);
      toDate.setDate(toDate.getDate() - 1);
      this.newPolicy.to_date = toDate.toISOString().substr(0, 10);
    },

    togglePlateInfo() {
      const typeId = this.newPolicy.type_id.type_id;
      const clientId = this.newPolicy.client_id.client_id;
      if (typeId == 2) {
        this.fetchVehicleDetails(clientId);
        this.fetchSubCategories(typeId);
      } else {
        this.fetchSubCategories(typeId);
      }
    },

    async fetchPolicies() {
      try {
        const data = await window.electron.fetchPolicies();
        this.policies = data;
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      }
    },

    fetchSubCategories(typeId) {
      window.electron
        .fetchSubCategories(typeId)
        .then((result) => {
          // console.log("Result from fetchSubCategories:", result);
          this.categories = result.map((item) => ({
            category_id: item.category_id,
            category_name: item.category_name,
          }));
        })
        .catch((error) => {
          console.error("Failed to fetch categories:", error);
          this.categories = [];
        });
    },

    fetchVehicleDetails(clientId) {
      if (!clientId) {
        // console.log("returned");
        return;
      }

      window.electron
        .fetchVehicleDetails(clientId)
        .then((result) => {
          this.vehicleDetails = result.map((item) => ({
            value: item.vehicle_id,
            label: item.vehicle_details,
            reference_name: item.reference_name,
          }));
          this.$nextTick(() => {
            console.log("Result from fetchVehicleDetails:", result);
          });
        })
        .catch((error) => {
          console.error("Error in fetchVehicleDetails:", error);
          this.vehicleDetails = [];
        });
    },

    showAddForm() {
      this.newPolicy.broker_id = {
        // Set default to the first usage option
        broker_id: this.brokers[0]?.broker_id,
        broker_name: this.brokers[0]?.broker_name,
      };
      this.showForm = true;
    },

    async fetchPolicyById(policyId) {
      // console.log("fetchPolicyById");
      try {
        const policyResult = await window.electron.fetchPolicyById(policyId);
        return policyResult;
      } catch (error) {
        console.error("Failed to fetch policy by ID:", error);
        throw error;
      }
    },

    goToClientsTablePage() {
      sessionStorage.setItem("initiatedFromAddPolicyForm", "true");
      this.showForm = false;
      this.$router.push({
        name: "clients",
        query: { showAddForm: "true", fromPage: "policies" },
      });
    },

    goToVehiclesPage() {
      sessionStorage.setItem("initiatedFromAddPolicyForm", "true");
      sessionStorage.setItem("clientId", this.newPolicy.client_id.client_id);
      this.showForm = false;
      this.$router.push({
        name: "vehicles",
        query: { showAddForm: "true", fromPage: "policies" },
      });
    },
    normalizePolicyNumber(policyNumber) {
      return policyNumber.trim().replace(/\s+/g, ""); // This will remove all spaces from the policy number.
    },

    async editPolicy(policy) {
      // console.log("editPolicy called with policy:", policy);
      this.isFormInEditMode = true;
      this.watchEnabled = false;
      let policyResult;
      try {
        policyResult = await this.fetchPolicyById(policy.policy_id);
      } catch (error) {
        console.error("Failed to fetch policy by ID:", error);
        return;
      }
      // Convert dates before assigning them to your form fields:
      policyResult.from_date = this.convertDateFormat(policyResult.from_date);
      policyResult.to_date = this.convertDateFormat(policyResult.to_date);
      // console.log("From Date:", policyResult.from_date);
      // console.log("To Date:", policyResult.to_date);

      // Populate the newPolicy object with the details of the policy to be edited
      this.newPolicy = {
        policy_id: policyResult.policy_id,
        policy_number: this.normalizePolicyNumber(policyResult.policy_number),
        client_id: {
          client_id: policyResult.client_id,
          client_name: policyResult.client_name,
        },
        type_id: {
          type_id: policyResult.type_id,
          type_name: policyResult.type_name,
        },
        category_id: {
          category_id: policyResult.category_id,
          category_name: policyResult.category_name,
        },
        vehicle_id: {
          value: policyResult.vehicle_id,
          label: policyResult.vehicle_details,
          reference_name: policyResult.reference_name,
        },
        total_premium: policyResult.total_premium,
        net_premium: policyResult.net_premium,
        company_comm: policyResult.company_comm,
        broker_comm: policyResult.broker_comm,
        from_date: policyResult.from_date,
        to_date: policyResult.to_date,
        broker_id: {
          broker_id: policyResult.broker_id,
          broker_name: policyResult.broker_name,
        },
        provider_id: {
          provider_id: policyResult.provider_id,
          provider_name: policyResult.provider_name,
        },
        coverage_details: policyResult.coverage_details,
      };

      if (this.newPolicy.type_id.type_id == 2) {
        this.fetchVehicleDetails(this.newPolicy.client_id.client_id);
        this.fetchSubCategories(this.newPolicy.type_id.type_id);
        this.newPolicy.vehicle_id.value = policyResult.vehicle_id;
        this.newPolicy.vehicle_id.label = policyResult.vehicle_details;
        this.newPolicy.vehicle_id.reference_name = policyResult.reference_name;
        this.previousTypeId = 2;
        this.previousClientId = this.newPolicy.client_id.client_id;
      } else {
        this.fetchSubCategories(this.newPolicy.type_id.type_id);
        this.newPolicy.vehicle_id = "";
        this.newPolicy.reference_name = "";
        this.previousTypeId = this.newPolicy.type_id.type_id;
        this.previousClientId = this.newPolicy.client_id.client_id;
      }
      // Set flags to indicate that the form should be shown in edit mode
      console.log("this.newPolicy: ", this.newPolicy);
      console.log("reference_name: ", policyResult);
      this.showForm = true;
      this.$nextTick(() => {
        this.isFormInEditMode = false;
        this.isEditing = true;
        this.watchEnabled = true;
      });
    },

    async renewPolicy(policy) {
      this.watchEnabled = false;
      this.isFormInEditMode = true;
      let policyResult;
      try {
        policyResult = await this.fetchPolicyById(policy.policy_id);
      } catch (error) {
        console.error("Failed to fetch policy by ID:", error);
        return;
      }
      // Populate the newPolicy object with the details of the policy to be renewed
      this.newPolicy = {
        policy_number: this.normalizePolicyNumber(policyResult.policy_number),
        client_id: {
          client_id: policyResult.client_id,
          client_name: policyResult.client_name,
        },
        type_id: {
          type_id: policyResult.type_id,
          type_name: policyResult.type_name,
        },
        category_id: {
          category_id: policyResult.category_id,
          category_name: policyResult.category_name,
        },
        vehicle_id: {
          value: policyResult.vehicle_id,
          label: policyResult.vehicle_details,
          reference_name: policyResult.reference_name,
        },
        total_premium: policyResult.total_premium,
        net_premium: policyResult.net_premium,
        company_comm: policyResult.company_comm,
        broker_comm: policyResult.broker_comm,
        from_date: policyResult.from_date,
        to_date: policyResult.to_date,
        broker_id: {
          broker_id: policyResult.broker_id,
          broker_name: policyResult.broker_name,
        },
        provider_id: {
          provider_id: policyResult.provider_id,
          provider_name: policyResult.provider_name,
        },
        coverage_details: policyResult.coverage_details,
      };
      if (this.newPolicy.type_id.type_id == 2) {
        this.fetchVehicleDetails(this.newPolicy.client_id.client_id);
        // console.log("policy result: ", policyResult);
        this.fetchSubCategories(this.newPolicy.type_id.type_id);
        this.newPolicy.vehicle_id.value = policyResult.vehicle_id;
        this.newPolicy.vehicle_id.label = policyResult.vehicle_details;
        this.newPolicy.vehicle_id.reference_name = policyResult.reference_name;
        this.previousTypeId = 2;
        this.previousClientId = this.newPolicy.client_id.client_id;
      } else {
        this.fetchSubCategories(this.newPolicy.type_id.type_id);
        this.newPolicy.vehicle_id = "";
        this.newPolicy.reference_name = "";
        this.previousTypeId = this.newPolicy.type_id.type_id;
        this.previousClientId = this.newPolicy.client_id.client_id;
      }
      console.log("Broker ID from Policy Result:", policyResult.broker_id);

      // Clear the policy number for renewal
      this.newPolicy.policy_number = "";
      let oldToDate = new Date(policyResult.to_date);
      this.newPolicy.from_date = new Date(
        oldToDate.setDate(oldToDate.getDate() + 1)
      )
        .toISOString()
        .split("T")[0];
      this.newPolicy.to_date = new Date(
        oldToDate.setDate(oldToDate.getDate() + 364)
      )
        .toISOString()
        .split("T")[0]; // Assuming a year-long policy.

      this.isRenewing = true;
      this.showForm = true;
      this.isFormInEditMode = false;
      this.$nextTick(() => {
        this.watchEnabled = true;
      });
    },
    async endorsePolicy(policy) {
      this.watchEnabled = false;
      this.isFormEndorsed = true;
      this.isFormInEditMode = true;
      let policyResult;
      try {
        policyResult = await this.fetchPolicyById(policy.policy_id);
      } catch (error) {
        console.error("Failed to fetch policy by ID:", error);
        return;
      }
      console.log(policyResult);
      this.newPolicy = {
        policy_number: this.normalizePolicyNumber(policyResult.policy_number),
        client_id: {
          client_id: policyResult.client_id,
          client_name: policyResult.client_name,
        },
        type_id: {
          type_id: policyResult.type_id,
          type_name: policyResult.type_name,
        },
        category_id: {
          category_id: policyResult.category_id,
          category_name: policyResult.category_name,
        },
        vehicle_id: {
          value: policyResult.vehicle_id,
          label: policyResult.vehicle_details,
          reference_name: policyResult.reference_name,
        },
        total_premium: policyResult.total_premium,
        net_premium: policyResult.net_premium,
        company_comm: policyResult.company_comm,
        broker_comm: policyResult.broker_comm,
        from_date: policyResult.from_date,
        to_date: policyResult.to_date,
        broker_id: {
          broker_id: policyResult.broker_id,
          broker_name: policyResult.broker_name,
        },
        provider_id: {
          provider_id: policyResult.provider_id,
          provider_name: policyResult.provider_name,
        },
        coverage_details: policyResult.coverage_details,
      };
      this.newPolicy.policy_number =
        "ENDORSEMENT/" + policyResult.policy_number;
      this.fetchVehicleDetails(this.newPolicy.client_id.client_id);
      this.fetchSubCategories(this.newPolicy.type_id.type_id);
      this.newPolicy.vehicle_id.value = policyResult.vehicle_id;
      this.newPolicy.vehicle_id.label = policyResult.vehicle_details;
      this.newPolicy.vehicle_id.reference_name = policyResult.reference_name;
      this.previousClientId = this.newPolicy.client_id.client_id;
      this.isRenewing = false;
      this.showForm = true;
      this.policyBeforeEndorsement = policy;
      this.$nextTick(() => {
        this.isFormInEditMode = false;
        this.watchEnabled = true;
      });
    },

    deletePolicy(policy) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this policy?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deletePolicy(
              policy.policy_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Policy deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchPolicies();
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete policy:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete policy.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {});
    },
    validatePolicyData(policyData) {
      const requiredFields = [
        { field: "policy_number", name: "Policy Number" },
        { field: "client_id.client_id", name: "Client" },
        { field: "type_id.type_id", name: "Policy Type" },
        { field: "category_id.category_id", name: "Policy Category" },
        { field: "total_premium", name: "Total Premium" },
        { field: "from_date", name: "From Date" },
        { field: "to_date", name: "To Date" },
        { field: "broker_id.broker_id", name: "Broker" },
        { field: "provider_id.provider_id", name: "Provider" },
      ];

      for (let req of requiredFields) {
        const value = this.getValueFromField(policyData, req.field);
        if (!value || value === "") {
          this.$q.notify({
            color: "red",
            message: `${req.name} is required.`,
            icon: "error",
            position: "bottom",
          });
          return false;
        }
      }
      return true;
    },

    getValueFromField(object, path) {
      const keys = path.split(".");
      let value = object;

      for (let key of keys) {
        value = value[key];
        if (value === undefined) {
          break;
        }
      }

      return value;
    },

    async addOrEditPolicy() {
      let response;
      try {
        const policyData = JSON.parse(JSON.stringify(this.newPolicy));
        // Normalize the policy number
        policyData.policy_number = this.normalizePolicyNumber(
          policyData.policy_number
        );
        // Add validation check
        if (!this.validatePolicyData(policyData)) {
          console.log("0-this.isEditing : ", this.isEditing);
          return; // Exit the function if validation fails
        }
        // Extract the provider_id value if it's an object
        policyData.client_id = policyData.client_id.client_id;
        policyData.type_id = policyData.type_id.type_id;
        policyData.category_id = policyData.category_id.category_id;
        policyData.vehicle_id = policyData.vehicle_id.value;
        policyData.reference_name = this.newPolicy.vehicle_id.reference_name;
        policyData.broker_id = policyData.broker_id.broker_id;
        policyData.provider_id = policyData.provider_id.provider_id;
        // Set data_saved_by from the local storage
        policyData.data_saved_by = localStorage.getItem("user");
        if (this.isFormEndorsed) {
          const policyNumberExists =
            await window.electron.checkPolicyNumberExists(
              policyData.policy_number
            );
          if (policyNumberExists) {
            this.$q.notify({
              color: "red",
              message:
                "Policy number already exists, even in deleted policies. Endorsing policy dismissed!",
              icon: "report_problem",
              position: "center",
            });
            return;
          }
          this.policyBeforeEndorsement.total_premium =
            -this.policyBeforeEndorsement.total_premium;
          this.policyBeforeEndorsement.net_premium =
            -this.policyBeforeEndorsement.net_premium;
          this.policyBeforeEndorsement.company_comm =
            -this.policyBeforeEndorsement.company_comm;
          this.policyBeforeEndorsement.broker_comm =
            -this.policyBeforeEndorsement.broker_comm;
          this.policyBeforeEndorsement.data_saved_by =
            localStorage.getItem("user");
          console.log(
            "this.policyBeforeEndorsement: ",
            this.policyBeforeEndorsement
          );
          const originalPolicyData = JSON.parse(
            JSON.stringify(this.policyBeforeEndorsement)
          );
          const changeValuesSigns = await window.electron.editPolicy(
            originalPolicyData
          );
          console.log(
            "this.policyBeforeEndorsement edited : ",
            this.policyBeforeEndorsement
          );
          const deleteEndResponse = await window.electron.deletePolicy(
            originalPolicyData.policy_id
          );
          policyData.active_status = 4;
          policyData.total_premium =
            Number(policyData.total_premium) -
            Number(this.policyBeforeEndorsement.total_premium);
          policyData.net_premium =
            Number(policyData.net_premium) -
            Number(this.policyBeforeEndorsement.net_premium);
          policyData.company_comm =
            Number(policyData.company_comm) -
            Number(this.policyBeforeEndorsement.company_comm);
          policyData.broker_comm =
            Number(policyData.broker_comm) -
            Number(this.policyBeforeEndorsement.broker_comm);
          response = await window.electron.addPolicy(policyData);
          // console.log("Response:", response);
          if (
            response === "success" &&
            changeValuesSigns === "success" &&
            deleteEndResponse === "success"
          ) {
            this.fetchPolicies();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Policy Endorsed successfully!",
            });
          } else {
            throw new Error(response);
          }
          this.isFormEndorsed = false;
        } else if (this.isEditing) {
          policyData.active_status = 2;
          response = await window.electron.editPolicy(policyData);
          if (response === "success") {
            this.fetchPolicies();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Policy edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else if (this.isRenewing) {
          const policyNumberExists =
            await window.electron.checkPolicyNumberExists(
              policyData.policy_number
            );
          if (policyNumberExists) {
            this.$q.notify({
              color: "red",
              message:
                "Policy number already exists, even in deleted policies. Renewing policy dismissed!",
              icon: "report_problem",
              position: "center",
            });
            return;
          }
          policyData.active_status = 3;
          response = await window.electron.addPolicy(policyData);
          // console.log("Response:", response);
          if (response === "success") {
            this.fetchPolicies();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Policy renewed successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const policyNumberExists =
            await window.electron.checkPolicyNumberExists(
              policyData.policy_number
            );
          if (policyNumberExists) {
            this.$q.notify({
              color: "red",
              message:
                "Policy number already exists, even in deleted policies. Adding policy dismissed!",
              icon: "report_problem",
              position: "center",
            });
            return;
          }
          this.isFormInEditMode = false;
          policyData.active_status = 1;
          response = await window.electron.addPolicy(policyData);
          if (response === "success") {
            this.fetchPolicies();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Policy added successfully!",
            });
          } else {
            throw new Error(response);
          }
        }
      } catch (error) {
        console.error("Failed operation:", error);
        this.$q.notify({
          color: "red",
          message: error.message || "An error occurred.",
        });
      } finally {
        // Only reset the flags if the response was successful
        if (response === "success") {
          this.isEditing = false;
          this.isRenewing = false;
          this.policyToEdit = null;
          this.isFormEndorsed = false;
        }
      }
    },
    resetForm() {
      this.newPolicy = {
        policy_id: "",
        policy_number: "",
        client_id: "",
        reference_name: "",
        type_id: "",
        category_id: "",
        vehicle_id: "",
        total_premium: 0,
        net_premium: 0,
        company_comm: 0,
        broker_comm: 0,
        from_date: "",
        to_date: "",
        broker_id: "",
        provider_id: "",
        coverage_details: "",
        data_saved_by: "",
        active_status: "",
      };
      this.watchEnabled = true;
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.isRenewing = false;
      this.policyToEdit = null;
      this.categories = [];
      this.previousTypeId = null;
      this.previousClientId = null;
      this.isFormInEditMode = false;
      this.isFormEndorsed = false;
    },
    handleKeydown(e) {
      if (e.key === "Escape" && this.showForm) {
        this.showForm = false;
        this.resetForm();
      }
    },
    filterClients(val, update) {
      if (val === "") {
        update(() => {
          this.clients = this.originalVehicleList; // Restore original list
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.clients = this.originalVehicleList.filter(
          (v) => v.client_name.toLowerCase().indexOf(needle) > -1
        );
      });
    },
  },

  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  watch: {
    "newPolicy.type_id": function (newTypeId) {
      console.log("0- newPolicy.type_id called");
      if (this.isFormInEditMode) return;

      if (newTypeId && newTypeId.type_id) {
        console.log("1- newPolicy.type_id called");
        if (newTypeId.type_id !== this.previousTypeId) {
          this.previousTypeId = newTypeId.type_id;
          this.newPolicy.category_id = "";
          this.newPolicy.vehicle_id = "";
        }
        if (newTypeId.type_id == 2) {
          this.newPolicy.category_id = "";
        }
      }
    },
    "newPolicy.client_id": function (newClientId) {
      console.log("0- newPolicy.client_id called");
      if (this.isFormInEditMode) return;

      if (newClientId && newClientId.client_id) {
        console.log("1- newPolicy.client_id called");
        if (
          newClientId.client_id !== this.previousClientId &&
          this.newPolicy.type_id.type_id == 2
        ) {
          this.previousClientId = newClientId.client_id;
          this.fetchVehicleDetails(newClientId.client_id);
          this.newPolicy.vehicle_id = "";
        }
      }
    },
    "newPolicy.total_premium": function (val) {
      if (!this.watchEnabled) {
        return;
      }
      console.log(
        "newPolicy.total_premium triggered and watcher is: ",
        this.watchEnabled
      );
      val = Number(val);
      let netPremium = Number(this.newPolicy.net_premium);
      if (netPremium && netPremium < val) {
        this.newPolicy.company_comm = val - netPremium;
        this.newPolicy.broker_comm = 0;
      } else {
        netPremium = 0;
        this.newPolicy.company_comm = 0;
        this.newPolicy.broker_comm = 0;
      }
    },
    "newPolicy.net_premium": function (val) {
      if (!this.watchEnabled) {
        return;
      }
      console.log(
        "newPolicy.net_premium triggered and watcher is: ",
        this.watchEnabled
      );
      val = Number(val);
      let totalPremium = Number(this.newPolicy.total_premium);

      if (val > totalPremium) {
        this.$q.notify({
          color: "red",
          message: "Net Premium is greater than Total Premium!",
          icon: "error",
          position: "center",
        });
        this.newPolicy.company_comm = 0;
        this.newPolicy.broker_comm = 0;
        this.newPolicy.total_premium = 0;
      } else {
        this.newPolicy.company_comm = totalPremium - val;
        this.newPolicy.broker_comm = 0;
      }
    },
    "newPolicy.broker_comm": function (val) {
      if (!this.watchEnabled) {
        return;
      }
      console.log(
        "newPolicy.broker_comm triggered and watcher is: ",
        this.watchEnabled
      );
      val = Number(val);
      let companyComm = Number(this.newPolicy.company_comm);
      let totalPremium = Number(this.newPolicy.total_premium);
      let netPremium = Number(this.newPolicy.net_premium);

      if (val > totalPremium - netPremium) {
        console.log("Company comm is : ", companyComm);
        console.log("broker comm is : ", val);
        this.$q.notify({
          color: "red",
          message: "Broker commission is greater than company commmission!",
          icon: "error",
          position: "center",
        });
        console.log("2- Company comm is : ", companyComm);
        console.log("2- broker comm is : ", val);
        if (this.newPolicy.broker_comm !== 0) {
          this.newPolicy.broker_comm = 0;
        }
      } else {
        this.newPolicy.company_comm = totalPremium - netPremium - val;
      }
    },
    // $route(to, from) {
    //   // Check if we're navigating back from the clients page or from policies page
    //   if (
    //     (from.name === "clients" || from.name === "vehicles") &&
    //     to.name === "policies"
    //   ) {
    //     // Check for any query params indicating the form should be shown
    //     if (this.showForm) {
    //       this.showForm = true;
    //     }
    //   }
    // },
  },
};
</script>
