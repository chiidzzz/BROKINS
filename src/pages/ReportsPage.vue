<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Main Table Column -->
      <div class="col">
        <div v-if="reportTitle" class="report-title">
          {{ reportTitle }}
        </div>
        <template v-if="useProvider && selectedProvider">
          <!-- Single Table -->
          <q-table
            class="q-table-1"
            :title="
              useProvider && selectedProvider
                ? selectedProvider.provider_name
                : 'Report'
            "
            :rows="
              useProvider && selectedProvider
                ? (
                    providerGroupedPolicies.find(
                      (group) =>
                        group.providerName === selectedProvider.provider_name
                    ) || {}
                  ).policies || []
                : policies
            "
            :columns="dynamicColumns"
            dense
            style="height: 800px"
            v-model:pagination="pagination"
            :rows-per-page-options="[0]"
            row-key="policy_id"
            flat
            bordered
            separator="cell"
            grid-mode="full"
            :filter="filter"
            v-model:selected="selected"
          >
            <!-- ...other slots -->
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
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props"> </q-td>
            </template>
            <template v-slot:bottom>
              <div class="table-summary">
                <div class="summary-item">
                  Total Policies: {{ totalPolicies }}
                </div>
                <div class="summary-item">
                  Total Premium: {{ totalPremium }}
                </div>
                <template v-if="reportTitle !== 'RENEWAL'">
                  <div class="summary-item">Net Premium: {{ netPremium }}</div>
                  <div class="summary-item">
                    Company Commission: {{ companyCommission }}
                  </div>
                  <div class="summary-item">
                    Broker Commission: {{ brokerCommission }}
                  </div>
                </template>
              </div>
            </template>
          </q-table>
        </template>

        <template v-else>
          <!-- Multiple Tables for Each Broker -->
          <div
            v-for="group in providerGroupedPolicies"
            :key="group.provider_name"
          >
            <q-table
              class="q-table"
              :title="group.providerName"
              :rows="group.policies"
              :columns="dynamicColumns"
              dense
              style="max-height: 400px"
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
              row-key="policy_id"
              flat
              bordered
              separator="cell"
              grid-mode="full"
              :filter="filter"
              v-model:selected="selected"
              :cell-style="cellStyle"
            >
              <!-- ...other slots -->
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
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props"> </q-td>
              </template>
              <template v-slot:bottom>
                <div class="table-summary">
                  <div class="summary-item">
                    Total Policies: {{ groupTotalPolicies(group) }}
                  </div>
                  <div class="summary-item">
                    Total Premium: {{ groupTotalPremium(group) }}
                  </div>
                  <template v-if="reportTitle !== 'RENEWAL'">
                    <div class="summary-item">
                      Net Premium: {{ groupNetPremium(group) }}
                    </div>
                    <div class="summary-item">
                      Company Commission: {{ groupCompanyCommission(group) }}
                    </div>
                    <div class="summary-item">
                      Broker Commission: {{ groupBrokerCommission(group) }}
                    </div>
                  </template>
                </div>
              </template>
            </q-table>
          </div>
          <div class="grand-totals" v-if="providerGroupedPolicies.length">
            <div class="bordered-box">
              <h5 class="totals-box-title">Grand Totals:</h5>
              <div class="totals-row">
                <div>Total Policies: {{ grandTotalPolicies }}</div>
                <div>Total Premium: {{ grandTotalPremium }}</div>
                <div>Net Premium: {{ grandNetPremium }}</div>
                <div>Company Commission: {{ grandCompanyCommission }}</div>
                <div>Broker Commission: {{ grandBrokerCommission }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Settings Card Column -->
      <div class="col-shrink q-ml-md">
        <q-card class="q-mt-md">
          <q-btn
            @click="printPDF"
            icon="print"
            label="Save PDF"
            class="mb-2 full-width"
          />
          <q-card-section>
            <div class="text-h6">Report Custom Settings</div>

            <!-- Date Inputs Group -->
            <div class="date-inputs-box">
              <q-toggle
                v-model="useStartDate"
                @input="toggleDateType"
                :label="toggleLabel"
              />

              <p class="box-title">
                {{
                  useStartDate
                    ? "Policy Start Date Between:"
                    : "Policy Expiry Date Between:"
                }}
              </p>
              <!-- Date From -->
              <q-input
                outlined
                dense
                v-model="from_date"
                label="Date From"
                type="date"
              />

              <!-- Date To -->
              <q-input
                outlined
                dense
                v-model="to_date"
                label="Date to"
                type="date"
              />
            </div>

            <!-- Insurance Providers -->
            <div class="q-mt-md">
              <q-checkbox v-model="useProvider" label="Insurance Provider" />
              <q-select
                outlined
                dense
                v-if="useProvider"
                v-model="selectedProvider"
                :options="providers"
                label="Provider"
                option-value="provider_id"
                option-label="provider_name"
              />
            </div>

            <!-- Policy Types -->
            <div class="q-mt-md">
              <q-checkbox v-model="usePolicyType" label="Policy Type" />
              <q-select
                outlined
                dense
                v-if="usePolicyType"
                v-model="selectedType"
                :options="policyTypes"
                label="Policy Type"
                option-value="type_id"
                option-label="type_name"
              />
            </div>

            <!-- Policy Category -->
            <div class="q-mt-md">
              <q-checkbox
                v-model="usePolicyCategory"
                label="Policy Category"
                :disable="!usePolicyType || !selectedType"
              />
              <q-select
                outlined
                dense
                v-if="usePolicyCategory"
                v-model="selectedCategory"
                :options="categories"
                label="Policy Category"
                option-value="category_id"
                option-label="category_name"
              />
            </div>

            <!-- Vehicle Type -->
            <div class="q-mt-md">
              <q-checkbox
                v-model="useVehicleType"
                label="Vehicle Type"
                :disable="!selectedType || selectedType.type_id !== 2"
              />
              <q-select
                outlined
                dense
                v-if="useVehicleType"
                v-model="selectedVehicleType"
                :options="vehicleTypes"
                label="Vehicle Type"
                option-value="type_id"
                option-label="type_name"
              />
            </div>

            <!-- Brokers -->
            <div class="q-mt-md">
              <q-checkbox v-model="useBrokers" label="Brokers" />
              <q-expansion-item
                v-if="useBrokers"
                label="Select Brokers"
                default-opened
                v-model="expanded"
              >
                <q-list bordered separator>
                  <q-item
                    v-for="broker in brokers"
                    :key="broker.broker_id"
                    clickable
                    v-ripple
                  >
                    <q-item-section>
                      <q-checkbox
                        v-model="selectedBrokers"
                        :val="broker.broker_id"
                        :label="broker.broker_name"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions vertical>
            <div class="full-width">
              <p class="box-title"><strong>Preset Options:</strong></p>
              <!-- Renewal -->
              <q-btn
                @click="renewalButtonClick()"
                label="Renewal"
                color="info"
                class="mb-2 full-width"
              />
              <!-- Portfolio -->
              <q-btn
                @click="portfolioButtonClick()"
                label="Portfolio"
                color="info"
                class="mb-2 full-width"
              />
            </div>
          </q-card-actions>
          <q-separator />
          <q-card-actions vertical>
            <q-btn @click="fetchReport" label="Build Report" color="dark" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
export default {
  data() {
    return {
      reportTitle: "",
      expanded: false,
      reportType: null,
      useStartDate: true,
      filter: null,
      from_date: null,
      to_date: null,
      useProvider: false,
      selectedProvider: null,
      usePolicyType: false,
      selectedType: null,
      usePolicyCategory: false,
      selectedCategory: null,
      useVehicleType: false,
      selectedVehicleType: null,
      useBrokers: false,
      selectedBrokers: [],
      clients: [],
      policies: [],
      providers: [],
      brokers: [],
      policyTypes: [],
      vehicleTypes: [],
      categories: [],
      providerGroupedPolicies: [],
      columnOrders: {
        renewal: [
          "insured_name",
          "reference_name",
          "policy_info",
          "policy_number",
          "date_to",
          "total_premium",
          "broker_name",
          "details",
        ],
        portfolio: [
          "policy_number",
          "date_from",
          "insured_name",
          "reference_name",
          "policy_info",
          "broker_name",
          "net_premium",
          "total_premium",
          "company_comm",
          "broker_comm",
        ],
        default: [
          "insured_name",
          "reference_name",
          "policy_info",
          "policy_number",
          "broker_name",
          "date_to",
          "total_premium",
          "net_premium",
          "company_comm",
          "broker_comm",
          "details",
        ],
      },
    };
  },

  async created() {
    try {
      this.providers = await window.electron.fetchProviders();
      this.policyTypes = await window.electron.fetchPolicyTypes();
      this.categories = await window.electron.fetchSubCategories();
      this.vehicleTypes = await window.electron.fetchVehicleTypes();
      this.originalVehicleList = await window.electron.fetchClientsFullName();
      this.brokers = await window.electron.fetchBrokers();
    } catch (error) {
      console.error(
        "Failed to fetch providers, policy types, categories, vehicles types, clients, or brokers.",
        error
      );
    }
  },

  methods: {
    async printPDF() {
      const pdf = new jsPDF();

      const header = (data, groupName) => {
        pdf.setFontSize(10);
        pdf.text("Societe JOWACO", 10, 10);
        pdf.text(this.reportTitle, pdf.internal.pageSize.width / 2, 20, {
          align: "center",
        });
        pdf.text(
          `${this.from_date} - ${this.to_date}`,
          pdf.internal.pageSize.width / 2,
          30,
          { align: "center" }
        );
        pdf.text(`Company: ${groupName}`, 10, 40);
        pdf.text(
          `Page: ${data.pageCount}`,
          10,
          pdf.internal.pageSize.height - 10
        );
      };

      for (const group of this.providerGroupedPolicies) {
        // Get headers dynamically based on dynamicColumns
        const headers = this.dynamicColumns.map((column) => column.label);

        // Map the policies to an array of arrays representing the rows in your table
        const tableBody = group.policies.map((policy) => {
          return headers.map((header) => {
            // Assuming policy object's keys match the header names. Adjust if necessary.
            return policy[header];
          });
        });

        pdf.autoTable({
          head: [headers],
          body: tableBody,
          startY: 50,
          didDrawPage: (data) => {
            header(data, group.providerName);
          },
        });

        if (
          group !==
          this.providerGroupedPolicies[this.providerGroupedPolicies.length - 1]
        ) {
          pdf.addPage();
        }
      }

      // Grand totals can be added similarly using another autoTable call or using text methods

      pdf.save("report.pdf");
    },
    toggleDateType() {
      this.useStartDate = !this.useStartDate;
    },
    prepareProviderData() {
      // Grouping policies by brokers
      const groupedPolicies = this.policies.reduce((acc, policy) => {
        const providerName = policy.provider_name;
        if (!acc[providerName]) acc[providerName] = [];
        acc[providerName].push(policy);
        return acc;
      }, {});
      // Converting object to an array for easier iteration in the template
      this.providerGroupedPolicies = Object.keys(groupedPolicies).map(
        (providerName) => ({
          providerName,
          policies: groupedPolicies[providerName],
        })
      );
    },

    convertDateFormat(dateString) {
      if (dateString.includes("-")) {
        // Check if date is already in YYYY-MM-DD format
        return dateString;
      } else {
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    },

    fetchPolicyCategories() {
      const typeId = this.selectedType.type_id;
      window.electron
        .fetchSubCategories(typeId)
        .then((result) => {
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

    normalizePolicyNumber(policyNumber) {
      return policyNumber.trim().replace(/\s+/g, ""); // This will remove all spaces from the policy number.
    },

    async fetchReport(reportType) {
      this.expanded = false;
      this.dynamicColumns = {};
      if (!this.from_date || !this.to_date) {
        this.$q.notify({
          color: "warning",
          message: "Please select both 'Date From' and 'Date To'.",
          icon: "error",
          position: "center",
        });
        return;
      }
      // Check for useProvider condition
      if (this.useProvider && !this.selectedProvider) {
        this.$q.notify({
          color: "warning",
          message:
            "Please select a Provider or uncheck the 'Insurance Provider' option.",
          icon: "error",
          position: "center",
        });
        return;
      }
      // Check for usePolicyType condition
      if (this.usePolicyType && !this.selectedType) {
        this.$q.notify({
          color: "warning",
          message:
            "Please select a Policy Type or uncheck the 'Policy Type' option.",
          icon: "error",
          position: "center",
        });
        return;
      }
      // Check for usePolicyCategory condition
      if (this.usePolicyCategory && !this.selectedCategory) {
        this.$q.notify({
          color: "warning",
          message:
            "Please select a Policy Category or uncheck the 'Policy Category' option.",
          icon: "error",
          position: "center",
        });
        return;
      }
      // Check for useVehicleType condition
      if (this.useVehicleType && !this.selectedVehicleType) {
        this.$q.notify({
          color: "warning",
          message:
            "Please select a Vehicle Type or uncheck the 'Vehicle Type' option.",
          icon: "error",
          position: "center",
        });
        return;
      }
      // Check for useBrokers condition
      if (this.useBrokers && !this.selectedBrokers.length) {
        this.$q.notify({
          color: "warning",
          message:
            "Please select at least one Broker or uncheck the 'Brokers' option.",
          icon: "error",
          position: "center",
        });
        return;
      }
      try {
        if (reportType === "portfolio") {
          this.reportTitle = "PORTFOLIO";
          this.useStartDate = true;
        } else if (reportType === "renewal") {
          this.reportTitle = "RENEWAL";
          this.useStartDate = false;
        } else {
          this.reportTitle = "CUSTOM REPORT";
        }
        // Gather the selected parameters from your component’s data
        const params = {
          from_date: this.from_date,
          to_date: this.to_date,
          useStartDate: this.useStartDate,
          useProvider: this.useProvider,
          selectedProvider: this.selectedProvider
            ? { provider_id: this.selectedProvider.provider_id }
            : null,
          usePolicyType: this.usePolicyType,
          selectedType: this.selectedType
            ? { type_id: this.selectedType.type_id }
            : null,
          usePolicyCategory: this.usePolicyCategory,
          selectedCategory: this.selectedCategory
            ? { category_id: this.selectedCategory.category_id }
            : null,
          useVehicleType: this.useVehicleType,
          selectedVehicleType: this.selectedVehicleType
            ? { type_id: this.selectedVehicleType.type_id }
            : null,
        };

        const reportData = await window.electron.fetchReport(params);
        const selectedBrokersArray = [...this.selectedBrokers];
        // Filter policies based on selected brokers if the useBrokers is true
        if (this.useBrokers && this.selectedBrokers.length > 0) {
          this.policies = reportData.filter((policy) => {
            return selectedBrokersArray.includes(policy.broker_id);
          });
        } else {
          // if useBrokers is false or no broker is selected, don't filter the policies
          this.policies = reportData;
        }
        this.prepareProviderData();
        this.$q.notify({
          progress: true,
          message: "Report Ready!",
          icon: "check",
          color: "green",
          position: "center",
        });
        setTimeout(() => {
          const notification = document.querySelector(".q-notification");
          if (notification) {
            notification.style.display = "none";
          }
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
    },
    clearTableData() {
      this.policies = [];
      this.providerGroupedPolicies = [];
      this.reportTitle = null;
      this.reportType = null;
      this.dynamicColumns = {};
      if (!this.useBrokers) {
        this.selectedBrokers = [];
      }
    },
    portfolioButtonClick() {
      this.clearTableData();
      if (this.from_date && this.to_date) {
        this.useProvider = false;
        this.usePolicyType = false;
        // Keep usePolicyCategory and useVehicleType if they are already disabled
        if (!this.usePolicyCategory) this.usePolicyCategory = false;
        if (!this.useVehicleType) this.useVehicleType = false;
        this.reportType = "portfolio";
        this.$forceUpdate();
        this.fetchReport("portfolio");
        // Call your report building and sorting function here
        this.buildAndSortReport();
      } else {
        this.$q.notify({
          color: "warning",
          message: "Please select both 'Date From' and 'Date To'.",
          icon: "error",
          position: "center",
        });
      }
    },
    renewalButtonClick() {
      this.clearTableData();
      if (this.from_date && this.to_date) {
        this.useProvider = false;
        this.usePolicyType = false;
        if (!this.usePolicyCategory) this.usePolicyCategory = false;
        if (!this.useVehicleType) this.useVehicleType = false;
        this.reportType = "renewal";
        this.$forceUpdate();
        this.fetchReport("renewal");
        // After data is fetched, your computed property should automatically adjust the columns
      } else {
        this.$q.notify({
          color: "warning",
          message: "Please select both 'Date From' and 'Date To'.",
          icon: "error",
          position: "center",
        });
      }
    },

    buildAndSortReport() {
      const filteredPolicies = this.policies.filter(
        (policy) =>
          new Date(policy.to_date) >= new Date(this.from_date) &&
          new Date(policy.to_date) <= new Date(this.to_date)
      );
    },
    // For Multiple Tables
    groupTotalPolicies(group) {
      return group.policies.length;
    },
    groupTotalPremium(group) {
      const total = group.policies.reduce(
        (sum, policy) => sum + policy.total_premium,
        0
      );
      return this.formatCurrency(total);
    },
    groupNetPremium(group) {
      const total = group.policies.reduce(
        (sum, policy) => sum + policy.net_premium,
        0
      );
      return this.formatCurrency(total);
    },
    groupCompanyCommission(group) {
      const total = group.policies.reduce(
        (sum, policy) => sum + policy.company_comm,
        0
      );
      return this.formatCurrency(total);
    },
    groupBrokerCommission(group) {
      const total = group.policies.reduce(
        (sum, policy) => sum + policy.broker_comm,
        0
      );
      return this.formatCurrency(total);
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },

  computed: {
    brokersOptions() {
      return this.brokers.map((broker) => ({
        label: broker.broker_name,
        value: broker.broker_id,
      }));
    },
    toggleLabel() {
      return this.useStartDate
        ? "Switch to Expiry Date"
        : "Switch to Start Date";
    },
    // For Single Table
    totalPolicies() {
      return this.policies.length;
    },
    totalPremium() {
      const total = this.policies.reduce(
        (sum, policy) => sum + policy.total_premium,
        0
      );
      return this.formatCurrency(total);
    },
    netPremium() {
      const total = this.policies.reduce(
        (sum, policy) => sum + policy.net_premium,
        0
      );
      return this.formatCurrency(total);
    },
    companyCommission() {
      const total = this.policies.reduce(
        (sum, policy) => sum + policy.company_comm,
        0
      );
      return this.formatCurrency(total);
    },
    brokerCommission() {
      const total = this.policies.reduce(
        (sum, policy) => sum + policy.broker_comm,
        0
      );
      return this.formatCurrency(total);
    },
    grandTotalPolicies() {
      return this.providerGroupedPolicies.reduce(
        (sum, group) => sum + this.groupTotalPolicies(group),
        0
      );
    },
    grandTotalPremium() {
      const total = this.providerGroupedPolicies.reduce(
        (sum, group) =>
          sum +
          parseFloat(this.groupTotalPremium(group).replace(/[^0-9.-]+/g, "")),
        0
      );
      return this.formatCurrency(total);
    },
    grandNetPremium() {
      const total = this.providerGroupedPolicies.reduce(
        (sum, group) =>
          sum +
          parseFloat(this.groupNetPremium(group).replace(/[^0-9.-]+/g, "")),
        0
      );
      return this.formatCurrency(total);
    },
    grandCompanyCommission() {
      const total = this.providerGroupedPolicies.reduce(
        (sum, group) =>
          sum +
          parseFloat(
            this.groupCompanyCommission(group).replace(/[^0-9.-]+/g, "")
          ),
        0
      );
      return this.formatCurrency(total);
    },
    grandBrokerCommission() {
      const total = this.providerGroupedPolicies.reduce(
        (sum, group) =>
          sum +
          parseFloat(
            this.groupBrokerCommission(group).replace(/[^0-9.-]+/g, "")
          ),
        0
      );
      return this.formatCurrency(total);
    },
    dynamicColumns() {
      const columns = [
        {
          name: "insured_name",
          label: "Client",
          align: "left",
          field: (row) => row.client_name,
          sortable: true,
        },
        {
          name: "reference_name",
          label: "Reference",
          align: "left",
          field: (row) => row.reference_name,
          sortable: true,
        },
        {
          name: "policy_type",
          label: "Policy Type",
          align: "left",
          field: (row) => row.type_name,
          sortable: true,
        },
        {
          name: "policy_category",
          label: "Policy Category",
          align: "left",
          field: (row) => row.category_name,
          sortable: true,
        },
        {
          name: "vehicle_type",
          label: "Vehicle Type",
          align: "left",
          field: (row) => row.vehicle_type_name,
          sortable: true,
        },
        {
          name: "policy_number",
          label: "Policy#",
          align: "left",
          field: (row) => this.normalizePolicyNumber(row.policy_number),
          sortable: true,
        },
        {
          name: "date_to",
          label: "Expiry Date",
          align: "left",
          field: (row) => moment(row.to_date).format("DD-MM-YYYY"),
          sortable: true,
        },
        {
          name: "date_from",
          label: "Start Date",
          align: "left",
          field: (row) => moment(row.from_date).format("DD-MM-YYYY"),
          sortable: true,
        },
        {
          name: "total_premium",
          label: "Total Premium",
          align: "left",
          field: (row) => row.total_premium + " $",
          sortable: true,
        },
        {
          name: "broker_name",
          label: "Broker",
          align: "left",
          field: (row) => row.broker_name,
          sortable: true,
        },
        {
          name: "policy_info",
          label: "Policy Info",
          align: "left",
          field: (row) => row.policy_info,
          sortable: true,
        },
        {
          name: "net_premium",
          label: "Net Premium",
          align: "left",
          field: (row) => row.net_premium + " $",
          sortable: true,
        },
        {
          name: "company_comm",
          label: "Company Comm.",
          align: "left",
          field: (row) => row.company_comm + " $",
          sortable: true,
        },
        {
          name: "broker_comm",
          label: "Broker Comm.",
          align: "left",
          field: (row) => row.broker_comm + " $",
          sortable: true,
        },
        {
          name: "details",
          label: "Details",
          align: "left",
          field: (row) => row.Coverage_info,
          sortable: true,
        },
      ];

      const order =
        this.columnOrders[this.reportType] || this.columnOrders.default;

      // Check if 'order' is undefined or null before mapping
      if (!order) {
        console.error("Order is undefined or null:", order);
        return [];
      }
      // Generate a mapping object from the columns array
      const columnMapping = columns.reduce((acc, col) => {
        acc[col.name] = col;
        return acc;
      }, {});

      // Map over the order array using the columnMapping object
      return order.map((columnName) => {
        if (!columnMapping[columnName]) {
          console.error("Column not found:", columnName);
          return {}; // or return a default column object
        }
        return columnMapping[columnName];
      });
    },
  },

  watch: {
    from_date(newVal) {
      if (newVal) {
        const startDate = new Date(newVal);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        this.to_date = endDate.toISOString().split("T")[0]; // format it back to YYYY-MM-DD
      }
    },
    selectedType(newVal) {
      if (!newVal) {
        this.categories = [];
      } else {
        if (newVal && newVal.type_id !== 2) {
          this.useVehicleType = false;
          this.selectedVehicleType = null;
        }
        this.selectedCategory = null;
        this.fetchPolicyCategories();
      }
    },
    usePolicyType(newVal) {
      if (!newVal) {
        this.selectedType = null;
        this.usePolicyCategory = false;
        this.selectedCategory = null;
        this.useVehicleType = false;
        this.selectedVehicleType = null;
      }
    },
    usePolicyCategory(newVal) {
      if (!newVal) {
        this.selectedCategory = null;
      }
    },
    useProvider(newVal) {
      if (!newVal) {
        this.selectedProvider = null;
      }
    },

    useBrokers(newVal) {
      if (!newVal) {
        this.selectedBrokers = [];
      }
    },
  },
};
</script>

<style>
.date-inputs-box {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.box-title {
  margin-bottom: 2px;
  text-align: center;
}

.full-width {
  width: 85%;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.table-summary {
  display: flex;
  justify-content: space-between; /* or space-around or space-evenly, based on your design preference */
  padding: 10px;
  background-color: #f9f9f9; /* or any color you prefer */
  border-top: 10px solid #ddd;
}

.summary-item {
  /* flex: 1; */
  text-align: right;
  padding: 0 5px; /* Add padding as necessary */
}

.q-table .q-table__container {
  max-height: 600px;
  overflow-y: auto;
}

.q-table-1 .q-table__container {
  max-height: 1000px; /* Adjust the height as you need */
  overflow-y: auto;
}

.bordered-box {
  border: 2px solid #ccc;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  background-color: #f9f9f9;
  height: 80px;
}

.totals-box-title {
  margin-top: 3px;
  margin-bottom: 4px;
}

.totals-row {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping onto the next line if necessary */
  justify-content: space-between; /* Distribute space between the items */
  margin-top: 2px;
}

.totals-row > div {
  margin: 0 10px; /* Add some spacing between each total */
}

.report-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

@media print {
  @page {
    size: A3 landscape;
    counter-increment: page;
    @top-right {
      content: "Page " counter(page);
    }
  }

  @page: before {
    content: "Page " counter(page);
    position: absolute;
    bottom: 0;
    right: 0;
  }

  td:nth-child(2),
  td:nth-child(3) {
    white-space: nowrap;
  }
}

thead {
  display: table-header-group;
}

tr {
  break-inside: avoid;
}
</style>
