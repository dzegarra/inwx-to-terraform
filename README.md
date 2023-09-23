# inwx-to-terraform

⚠️ This tool is not ready for production use yet. Only the inwx_domain resource is supported at the moment.

Tool to import INWX domains into Terraform using the Import [Configuration feature](https://developer.hashicorp.com/terraform/tutorials/state/state-import) 
introduced in Terraform v1.5 and using the official INWX provider.

## Goals

- Import all domains from INWX into Terraform with a single command.
- Overcome the current bug in the official Terraform INWX provider that consist on not importing the required "content" property of each domain record.

## Preparation

Create a .env file in the root of this repository with the following content:

```
INWX_USER=your-inwx-username
INWX_PASSWORD=your-inwx-password
```

## Usage

```
# Install NPM dependencies
npm install

# Create inwx_domain Terraform resources in the "output" directory
npm run start
```

# Using the generated files

```
# Configure INWX Provider in your Terraform project
# Instruction at https://registry.terraform.io/providers/inwx/inwx/latest/docs

# Initialize Terraform (this will install the provider)
terraform init

# Copy the generated files into the Terraform directory
cp -r ../inwx-to-terraform/output .

# Apply the changes to create/update the .tfstate file
terraform apply
```

Since this tool creates the `import` and `inwx_domain` blocks, there's no need to run `terraform plan -generate-config-out=?` to generate the configuration files. 

The `terraform apply` will present the plan of changes before making any change. Make sure to review the changes before applying them.
