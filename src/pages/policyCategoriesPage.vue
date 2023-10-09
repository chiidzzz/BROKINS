<template>
  <q-page padding>
    <q-table
      title="Policies Categories"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="categories"
      :columns="columns"
      row-key="category_id"
      :visible-columns="['category_name', 'type_name', 'actions']"
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
          label="Add Category"
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
            @click="editCategory(props.row)"
          >
            <q-tooltip class="bg-info"> Edit Category </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteCategory(props.row)">
            <q-tooltip class="bg-negative"> Remove Category </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Policy Category" : "Add New Policy Category" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Category Name -->
          <q-input
            outlined
            v-model="newCategory.category_name"
            label="Category Name"
            @keyup.enter="addOrEditCategory"
          />

          <!-- Policy Type -->
          <q-select
            outlined
            v-model="newCategory.type_id"
            :options="policyTypes"
            label="Policy Type"
            :option-value="(option) => option.type_id"
            option-label="type_name"
            @keyup.enter="addOrEditCategory"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditCategory" />
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
      categories: [],
      policyTypes: [],
      columns: [
        {
          name: "category_name",
          label: "Category Name",
          align: "left",
          field: (row) => row.category_name,
          sortable: true,
        },
        {
          name: "type_name",
          label: "Policy Type",
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
      newCategory: {
        category_name: "",
        type_id: "",
      },
      showForm: false,
      isEditing: false,
      categoryToEdit: null,
    };
  },

  async created() {
    this.fetchCategories();
    try {
      this.policyTypes = await window.electron.fetchPolicyTypes();
    } catch (error) {
      console.error("Failed to fetch category types:", error);
    }
  },

  methods: {
    async fetchCategories() {
      try {
        const data = await window.electron.fetchCategories();
        this.categories = data;
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    },

    async fetchSubCategories(typeId) {
      // console.log("fetchSubCategories called with typeId:", typeId);
      if (typeId === undefined) return;
      try {
        this.categories = await window.electron.fetchSubCategories(typeId); // Pass typeId
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        this.categories = [];
      }
    },
    showAddForm() {
      this.showForm = true;
    },

    editCategory(category) {
      this.isEditing = true;
      this.categoryToEdit = category;

      // Find the category type object that matches the type_id of the category
      const policyType = this.policyTypes.find(
        (type) => type.type_id === category.type_id
      );

      // Check if policyType is found
      if (!policyType) {
        console.error(
          "Policy type not found for policy_type:",
          category.type_id
        );
        return; // Exit the method if policyType is not found
      }
      this.newCategory = {
        category_id: category.category_id,
        category_name: category.category_name,
        type_id: policyType, // Set the entire type object
      };
      this.showForm = true;
    },

    deleteCategory(category) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this category?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteCategory(
              category.category_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Category deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchCategories();
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete category:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete category.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("Delete category cancelled");
        });
    },

    async addOrEditCategory() {
      try {
        const categoryData = JSON.parse(JSON.stringify(this.newCategory));
        categoryData.type_id = categoryData.type_id.type_id;
        // console.log("Data to send:", categoryData);
        if (this.isEditing) {
          const response = await window.electron.editCategory(categoryData);
          if (response === "success") {
            this.fetchCategories();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Category edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addCategory(categoryData);
          if (response === "success") {
            this.fetchCategories();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Category added successfully!",
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
        this.categoryToEdit = null;
      }
    },

    resetForm() {
      this.newCategory = {
        category_name: "",
        type_id: "",
      };
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.categoryToEdit = null;
    },
  },
  watch: {
    "newPolicy.type_id": function (newTypeId) {
      if (newTypeId && newTypeId.type_id) {
        this.fetchSubCategories(newTypeId.type_id);
        // console.log("watch triggered:", newTypeId.type_id);
      }
    },
  },
};
</script>
