<template>
  <q-page padding>
    <q-table
      title="Brokers"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="brokers"
      :columns="columns"
      row-key="broker_id"
      :pagination="{ rowsPerPage: 25 }"
      flat
      bordered
      grid-mode="full"
      :filter="filter"
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
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          class="q-ml-md"
          color="primary"
          icon="add"
          label="Add Broker"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat no-caps dense @click="editBroker(props.row)">
            <q-tooltip class="bg-info"> Edit Broker </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteBroker(props.row)">
            <q-tooltip class="bg-negative"> Remove Broker </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Broker" : "Add New Broker" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Broker Name -->
          <q-input
            outlined
            v-model="newBroker.broker_name"
            label="Broker Name"
            @keyup.enter="addOrEditBroker"
          />
          <!-- Notes -->
          <q-input
            outlined
            v-model="newBroker.notes"
            label="Notes"
            @keyup.enter="addOrEditBroker"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditBroker" />
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
      brokers: [],
      columns: [
        {
          name: "broker_name",
          label: "Broker Name",
          align: "left",
          field: (row) => row.broker_name,
          sortable: true,
        },
        {
          name: "notes",
          label: "Notes",
          align: "left",
          field: (row) => row.notes,
          sortable: true,
        },
        {
          name: "actions",
          label: "Actions",
          align: "center",
          field: (row) => row,
          sortable: false,
        },
      ],
      newBroker: {
        broker_name: "",
        notes: "",
      },
      showForm: false,
      isEditing: false,
      brokerToEdit: null,
    };
  },
  async created() {
    this.fetchBrokers();
  },
  methods: {
    async fetchBrokers() {
      try {
        const data = await window.electron.fetchBrokers();
        this.brokers = data;
      } catch (error) {
        console.error("Failed to fetch brokers:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },
    editBroker(broker) {
      this.isEditing = true;
      this.brokerToEdit = broker;
      this.newBroker = {
        broker_name: broker.broker_name,
        notes: broker.notes,
      };
      this.showForm = true;
    },
    deleteBroker(broker) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this broker?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteBroker(
              broker.broker_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Broker deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchBrokers(); // Refresh the broker list
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete broker:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete broker.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("Delete broker cancelled");
        });
    },
    async addOrEditBroker() {
      try {
        const brokerData = JSON.parse(JSON.stringify(this.newBroker));
        if (this.isEditing) {
          brokerData.broker_id = this.brokerToEdit.broker_id; // Add the broker_id for editing
          const response = await window.electron.editBroker(brokerData);
          if (response === "success") {
            this.fetchBrokers();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Broker edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addBroker(brokerData);
          if (response === "success") {
            this.fetchBrokers();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Broker added successfully!",
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
        // Reset the form and related flags
        this.isEditing = false;
        this.brokerToEdit = null;
      }
    },
    resetForm() {
      this.newBroker = {
        broker_name: "",
        notes: "",
      };
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.brokerToEdit = null;
    },
  },
};
</script>
