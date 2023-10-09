<template>
  <q-page padding>
    <q-table
      title="Policies Types"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="policyTypes"
      :columns="columns"
      row-key="type_id"
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
          label="Add Type"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat no-caps dense @click="editType(props.row)">
            <q-tooltip class="bg-info"> Edit Type </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteType(props.row)">
            <q-tooltip class="bg-negative"> Remove Type </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Policy Type" : "Add New Policy Type" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Type Name -->
          <q-input
            outlined
            v-model="newType.type_name"
            label="Type Name"
            @keyup.enter="addOrEditType"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditType" />
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
      policyTypes: [],
      columns: [
        {
          name: "type_name",
          label: "Type Name",
          align: "left",
          field: (row) => row.type_name,
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
      newType: {
        type_name: "",
      },
      showForm: false,
      isEditing: false,
      typeToEdit: null,
    };
  },
  async created() {
    this.fetchPolicyTypes();
  },
  methods: {
    async fetchPolicyTypes() {
      try {
        const data = await window.electron.fetchPolicyTypes();
        this.policyTypes = data;
      } catch (error) {
        console.error("Failed to fetch policy types:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },
    editType(type) {
      this.isEditing = true;
      this.typeToEdit = type;
      this.newType = {
        type_name: type.type_name,
      };
      this.showForm = true;
    },
    deleteType(type) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this policy type?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deletePolicyType(
              type.type_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Policy type deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchPolicyTypes(); // Refresh the policy type list
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete policy type:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete policy type.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("Delete policy type cancelled");
        });
    },
    async addOrEditType() {
      try {
        const typeData = JSON.parse(JSON.stringify(this.newType));
        if (this.isEditing) {
          typeData.type_id = this.typeToEdit.type_id; // Add the type_id for editing
          const response = await window.electron.editPolicyType(typeData);
          if (response === "success") {
            this.fetchPolicyTypes();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Policy type edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addPolicyType(typeData);
          if (response === "success") {
            this.fetchPolicyTypes();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Policy type added successfully!",
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
        this.typeToEdit = null;
      }
    },
    resetForm() {
      this.newType = {
        type_name: "",
      };
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.typeToEdit = null;
    },
  },
};
</script>
