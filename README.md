# inwx-to-terraform

Tool to import INWX domains into Terraform using the Import [Configuration feature](https://developer.hashicorp.com/terraform/tutorials/state/state-import) introduced in Terraform v1.5 and using the official INWX provider.

## Goals

- Create the Terraform resources `inwx_domain`, `inwx_domain_contact`, and `inwx_nameserver_record` for all the domains in my INWX account.
- Create the `import` blocks to tell Terraform which resources to "import" into the state file.
- Do not bloat the `inwx_nameserver_record` blocks. Keep only the non-default parameter values.
- Overcome the current bug in the official Terraform INWX provider that consist on not importing the required `content` property of each domain record (at 21-09-2023).

## Preparation

Create a .env file in the root of this repository with the following content:

```
INWX_USER=your-inwx-username
INWX_PASSWORD=your-inwx-password
INWX_2FA_SECRET=
```

## Usage

```
# Install NPM dependencies
npm install

# Create the Terraform resources in the "output" directory
npm run start

# Re-format terraform files in ./output using the "terraform ftm" command
npm run fmt
```

# Using the generated files

```
# Configure INWX Provider in your Terraform project
# Instructions at https://registry.terraform.io/providers/inwx/inwx/latest/docs

# Initialize Terraform (this will install the provider)
terraform init

# Copy the generated files into the Terraform directory
cp -r ../inwx-to-terraform/output/* .

# Apply the changes to create/update the .tfstate file
terraform apply
```

Since this tool creates the `import` blocks as well, there's no need to run `terraform plan -generate-config-out=xxx` to generate the configuration files. 

The `terraform apply` will present the plan of changes before making any change. Make sure to review the changes before applying them.

# Resource's naming convention

> Terraform resource names can only contain letters, digits, underscores, and dashes. They must start with a letter and cannot end with a dash.

The following naming convention is used for the resources:

- **Domains (`inwx_domain`):** domain
- **Domain records (`inwx_nameserver_record`):** domain_type_record#
- **SPF domain records (`inwx_nameserver_record`):** domain_type_record_spf#

### Legend

- **type**: Record type (A, AAAA, CNAME, MX, TXT, etc.) in lowercase
- **record**: Record name with underscores instead of non-letter. All in lowercase.
- **domain**: Domain name with underscores instead of non-letter. All in lowercase.
- **#**: If the same identifier appears more than once, a number is appended to it.

# Other resources

- [Terraform INWX provider](https://registry.terraform.io/providers/inwx/inwx/latest/docs)
- [INWX API documentation](https://www.inwx.com/en/help/apidoc)
- [Terraform Import configuration](https://developer.hashicorp.com/terraform/tutorials/state/state-import)
- [Exploring the Import Block in Terraform 1.5](https://www.youtube.com/watch?v=znfh_00EDZ0)
