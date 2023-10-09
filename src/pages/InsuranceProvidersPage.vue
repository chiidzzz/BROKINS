<template>
  <q-page padding>
    <q-table
      title="Insurance Providers"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="providers"
      :columns="columns"
      row-key="provider_id"
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
          label="Add Provider"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="edit"
            flat
            no-caps
            dense
            @click="editProvider(props.row)"
          >
            <q-tooltip class="bg-info"> Edit Provider </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteProvider(props.row)">
            <q-tooltip class="bg-negative"> Remove Provider </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Provider" : "Add New Provider" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Provider Name -->
          <q-input
            outlined
            v-model="newProvider.provider_name"
            label="Provider Name"
            @keyup.enter="addOrEditProvider"
          />

          <!-- Contact Number -->
          <q-input
            outlined
            v-model="newProvider.contact_number"
            label="Contact Number"
            @keyup.enter="addOrEditProvider"
          />

          <!-- Contact Email -->
          <q-input
            outlined
            v-model="newProvider.contact_email"
            label="Contact Email"
            type="email"
            @keyup.enter="addOrEditProvider"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditProvider" />
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
      providers: [],
      columns: [
        {
          name: "provider_name",
          label: "Provider Name",
          align: "left",
          field: "provider_name",
          sortable: true,
        },
        {
          name: "contact_number",
          label: "Contact Number",
          align: "left",
          field: "contact_number",
          sortable: true,
        },
        {
          name: "contact_email",
          label: "Contact Email",
          align: "left",
          field: "contact_email",
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
      newProvider: {
        provider_name: "",
        contact_number: "",
        contact_email: "",
      },
      showForm: false,
      isEditing: false,
      providerToEdit: null,
    };
  },
  async created() {
    this.fetchProviders();
  },
  methods: {
    async fetchProviders() {
      try {
        const data = await window.electron.fetchProviders();
        this.providers = data;
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },
    editProvider(provider) {
      this.isEditing = true;
      this.providerToEdit = provider;
      this.newProvider = {
        provider_name: provider.provider_name,
        contact_number: provider.contact_number,
        contact_email: provider.contact_email,
      };
      this.showForm = true;
    },
    deleteProvider(provider) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this provider?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteProvider(
              provider.provider_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Provider deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchProviders(); // Refresh the provider list
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete provider:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete provider.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {});
    },
    async addOrEditProvider() {
      try {
        const providerData = JSON.parse(JSON.stringify(this.newProvider));
        if (this.isEditing) {
          providerData.provider_id = this.providerToEdit.provider_id; // Add the provider_id for editing
          const response = await window.electron.editProvider(providerData);
          if (response === "success") {
            this.fetchProviders();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Provider edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addProvider(providerData);
          if (response === "success") {
            this.fetchProviders();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Provider added successfully!",
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
        this.providerToEdit = null;
      }
    },

    resetForm() {
      this.newProvider = {
        provider_name: "",
        contact_number: "",
        contact_email: "",
      };
    },

    cancelAddition() {
      this.showForm = false;
      this.isEditing = false;
      this.newProvider = {
        provider_name: "",
        contact_number: "",
        contact_email: "",
      };
    },
  },
};
</script>

<style>
/* Add your custom styles here */
</style>
