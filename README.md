# inwx-to-terraform

Tool to import INWX domains into Terraform using the Import [Configuration feature](https://developer.hashicorp.com/terraform/tutorials/state/state-import) introduced in Terraform v1.5 to be used the official [Terraform INWX provider](https://registry.terraform.io/providers/inwx/inwx/latest/docs).

## Goals

- Create the Terraform resources `inwx_domain`, `inwx_domain_contact`, and `inwx_nameserver_record` for all the domains in my INWX account.
- Create the `import` blocks to tell Terraform which resources to "import" into the state file.
- Do not bloat the `inwx_nameserver_record` blocks. Keep only the non-default parameter values.
- Overcome the current bug in the official Terraform INWX provider that consist on not importing the required `content` property of each domain record (at 21-09-2023).

## Preparation

> ⚠️ This tool requires Node.js version 18 or higher.

Create a .env file in the root of this repository with the following content:

```dotenv
INWX_USER=your-inwx-username
INWX_PASSWORD=your-inwx-password
INWX_2FA_SECRET=
```

You can also define the environment variables directly in the command line before running the tool.

## Usage

```shell
# If you have the credentials in the .env file or already available in the environment variables
npx inwx-to-terraform

# If you want to define the credentials in the command line
INWX_USER=your-inwx-username INWX_PASSWORD=your-inwx-password npx inwx-to-terraform -y
```

## Using the generated files

```shell
# Configure INWX Provider in your Terraform project
# Instructions at https://registry.terraform.io/providers/inwx/inwx/latest/docs

# Initialize Terraform (this will install the provider)
terraform init

# Copy the generated files into the Terraform directory
cp -r ./output/* .

# Apply the changes to create/update the .tfstate file
terraform apply

# Once the Terraform state is created and synchronized with the INWX account, you can remove the import.tf file.
# I recommend to auto-format all the generated files with the "terraform fmt" command before commit them. 
```

Since this tool creates the `import` blocks as well, there's no need to run `terraform plan -generate-config-out=xxx` to generate the configuration files. 

The `terraform apply` will present the plan of changes before making any change. Make sure to review the changes before applying them.

## Resource's naming convention

> Terraform resource names can only contain letters, digits, underscores, and dashes. They must start with a letter and cannot end with a dash.

The following naming convention is used for the resources:

- **Domains (`inwx_domain`):** domain
- **Contacts (`inwx_domain_contact`):** ctype_cname
- **Domain records (`inwx_nameserver_record`):** domain_type_record#
- **SPF domain records (`inwx_nameserver_record`):** domain_type_record_spf#

### Legend

- **domain**: Domain name with underscores instead of non-letter. All in lowercase.
- **ctype**: Contact type (PERSON, ORG, ROLE) in lowercase
- **cname**: Contact's name in lowercase with underscores instead of non-letter. All in lowercase.
- **type**: Record type (A, AAAA, CNAME, MX, TXT, etc.) in lowercase
- **record**: Record name with underscores instead of non-letter. All in lowercase.
- **#**: If the same identifier appears more than once, a number is appended to it.

## Output examples

```hcl
# contacts.tf
resource "inwx_domain_contact" "org_guy_one" {
    type = "ORG"
    name = "Guy One"
    street_address = "123 Main Street"
    city = "Brussels"
    postal_code = "1060"
    country_code = "BE"
    phone_number = "+3212345678"
    email = "guy-one@gmail.com"
    organization = "My Company"
    whois_protection = true
}

# example.com.tf
resource "inwx_domain" "example_com" {
    name = "example.com"
    nameservers = ["ns.inwx.de","ns2.inwx.de","ns3.inwx.eu"]
    period = "1Y"
    renewal_mode = "AUTORENEW"
    transfer_lock = true
    contacts {
        admin = inwx_domain_contact.org_guy_one.id
        billing = inwx_domain_contact.org_guy_one.id
        registrant = inwx_domain_contact.org_guy_one.id
        tech = inwx_domain_contact.org_guy_one.id
    }
}
resource "inwx_nameserver_record" "example_com_a" {
    domain = "example.com"
    type = "A"
    content = "123.123.123.123"
}
resource "inwx_nameserver_record" "example_com_aaaa" {
    domain = "example.com"
    type = "AAAA"
    content = "6a01:4a1:1c0c:8795::1"
}
resource "inwx_nameserver_record" "example_com_cname_www" {
    domain = "example.com"
    type = "CNAME"
    name = "www.example.com"
    content = "traefik.example.com"
    # The TTL property appears here only because this record doesn't use the default value which is 3600 seconds
    ttl = 3601
}

# import.tf - This file tells Terraform how to match the the new resources with the existing ones from the provider
import {
    id = 501159
    to = inwx_domain_contact.org_guy_one
}
import {
    id = "example.com"
    to = inwx_domain.example_com
}
import {
    id = "example.com:386913084"
    to = inwx_nameserver_record.example_com_a
}
import {
    id = "example.com:382953086"
    to = inwx_nameserver_record.example_com_aaaa
}
import {
    id = "example.com:286953015"
    to = inwx_nameserver_record.example_com_cname_www
}
```

## Other resources

- [Terraform INWX provider](https://registry.terraform.io/providers/inwx/inwx/latest/docs)
- [INWX API documentation](https://www.inwx.com/en/help/apidoc)
- [Terraform Import configuration](https://developer.hashicorp.com/terraform/tutorials/state/state-import)
- [Exploring the Import Block in Terraform 1.5](https://www.youtube.com/watch?v=znfh_00EDZ0)
