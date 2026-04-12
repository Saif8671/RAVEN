export const POLICY_TEMPLATES = {
  info_sec: {
    id: "info_sec",
    name: "Information Security Policy",
    description: "The core document defining how your company protects its data and assets.",
    content: `# Information Security Policy

**Effective Date:** April 2026
**Approved By:** Management

## 1. Objective
The objective of this policy is to ensure the confidentiality, integrity, and availability of information assets within [Your Company Name].

## 2. Scope
This policy applies to all employees, contractors, and third-party partners who have access to [Your Company Name]'s data.

## 3. Data Classification
All company data must be classified into one of the following categories:
- **Public:** Information meant for external release.
- **Internal:** Standard business data with low impact if leaked.
- **Confidential:** Sensitive business information (e.g., financials, strategy).
- **Restricted:** Highly sensitive personal or secret data (e.g., customer PII).

## 4. Access Control
- Access to systems must be granted based on the principle of "least privilege."
- User identities must be verified before granting access.
- Dormant accounts must be deactivated after 90 days.

## 5. Security Awareness
All staff must undergo security awareness training upon hire and annually thereafter.

## 6. Compliance
Violations of this policy may result in disciplinary action, up to and including termination.`,
  },
  acceptable_use: {
    id: "acceptable_use",
    name: "Acceptable Use Policy (AUP)",
    description: "Rules for employee use of company devices, internet, and communication tools.",
    content: `# Acceptable Use Policy

**Effective Date:** April 2026
**Approved By:** Management

## 1. Overview
This policy defines the acceptable behavior for using [Your Company Name]'s technology resources.

## 2. Personal Use
While occasional personal use of company equipment is permitted, it must not interfere with work duties or violate any other company policies.

## 3. Prohibited Activities
Users must NOT:
- Use company resources for illegal activities.
- Share passwords or allow unauthorized access to systems.
- Attempt to bypass security controls or gain unauthorized access to other systems.
- Download or store pirated software or illegal content.
- Use company email to send offensive or harassing material.

## 4. Monitoring
[Your Company Name] reserves the right to monitor the use of its technology resources to ensure compliance with this policy and to protect business interests.

## 5. Reporting
Employees must report any known or suspected violations of this policy to Management or the IT Security Team.`,
  },
  password_policy: {
    id: "password_policy",
    name: "Password & Authentication Policy",
    description: "Standards for password complexity and multi-factor authentication (MFA).",
    content: `# Password & Authentication Policy

**Effective Date:** April 2026
**Approved By:** Management

## 1. Purpose
To establish standards for creating, protecting, and changing strong passwords.

## 2. Password Complexity
All user-level passwords must meet the following minimum requirements:
- At least 12 characters long.
- Contains a mix of uppercase, lowercase, numbers, and symbols.
- Must not contain the user's name or common words (e.g., "password123").

## 3. Multi-Factor Authentication (MFA)
MFA is MANDATORY for all external-facing accounts (e.g., Email, VPN, Cloud Services).

## 4. Password Protection
- Passwords must NOT be shared with anyone.
- Passwords must NOT be written down or stored in plain text.
- Use of a company-approved Password Manager is highly recommended.

## 5. Password Changes
Passwords should only be changed if there is a suspicion of compromise. Automatic periodic rotation is not required unless specified by regulatory compliance.`,
  },
  incident_response: {
    id: "incident_response",
    name: "Incident Response Policy",
    description: "Guidelines on how to report and handle a suspected security breach.",
    content: `# Incident Response Policy

**Effective Date:** April 2026
**Approved By:** Management

## 1. Objective
To ensure that security incidents are identified, contained, and resolved efficiently.

## 2. Internal Reporting
Any employee who suspects a security incident (e.g., lost laptop, phishing click, unusual system behavior) must report it immediately to the IT Helpdesk or Management.

## 3. Incident Classification
Incidents will be classified by severity:
- **Low:** Minimal impact, single user affected.
- **Medium:** Potential for data loss, degraded service.
- **High:** Confirmed data breach, significant outage, or ransom attack.

## 4. Response Team
The Incident Response Team consists of [Your Company Name]'s management and IT service provider.

## 5. Containment & Recovery
The priority is to contain the threat (e.g., isolating a machine) before proceeding with forensic investigation and restoration of services.

## 6. Communication
Only Management is authorized to communicate about a security incident with external parties (customers, media, or regulators).`,
  },
};
