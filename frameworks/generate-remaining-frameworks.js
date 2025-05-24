#!/usr/bin/env node

/**
 * Script to generate the remaining framework JSON files
 * This creates templates for HITRUST, NIST, HIPAA, SOX, GDPR, FedRAMP, and MCSB
 */

const fs = require('fs');
const path = require('path');

const frameworks = {
    "hitrust": {
        framework: "HITRUST CSF v11.2.0",
        description: "Health Information Trust Alliance Common Security Framework",
        version: "11.2.0",
        domains: [
            {
                name: "Access Control",
                controls: [
                    {
                        id: "01.a",
                        title: "Access Control Policy",
                        description: "Access control policies are established and maintained.",
                        compliance_level: "required",
                        automation_possible: true,
                        verification_method: "automated",
                        references: ["https://hitrustalliance.net/csf/"],
                        pulumi_policies: [],
                        clouds: []
                    }
                ]
            }
        ]
    },
    "nist": {
        framework: "NIST Cybersecurity Framework v1.1",
        description: "National Institute of Standards and Technology Cybersecurity Framework",
        version: "1.1",
        functions: [
            {
                name: "Identify",
                categories: [
                    {
                        id: "ID.AM",
                        title: "Asset Management",
                        subcategories: [
                            {
                                id: "ID.AM-1",
                                title: "Physical devices and systems inventory",
                                description: "Physical devices and systems within the organization are inventoried",
                                compliance_level: "recommended",
                                automation_possible: true,
                                verification_method: "automated",
                                references: ["https://www.nist.gov/cyberframework"],
                                pulumi_policies: [],
                                clouds: []
                            }
                        ]
                    }
                ]
            },
            {
                name: "Protect",
                categories: [
                    {
                        id: "PR.AC",
                        title: "Identity Management and Access Control",
                        subcategories: [
                            {
                                id: "PR.AC-1",
                                title: "Identities and credentials management",
                                description: "Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes",
                                compliance_level: "required",
                                automation_possible: true,
                                verification_method: "automated",
                                references: ["https://www.nist.gov/cyberframework"],
                                pulumi_policies: [],
                                clouds: []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "hipaa": {
        framework: "HIPAA Security Rule",
        description: "Health Insurance Portability and Accountability Act Security Rule",
        version: "2003",
        safeguards: [
            {
                name: "Administrative Safeguards",
                standards: [
                    {
                        id: "164.308(a)(1)",
                        title: "Security management process",
                        description: "Implement policies and procedures to prevent, detect, contain, and correct security violations.",
                        compliance_level: "required",
                        automation_possible: true,
                        verification_method: "automated",
                        references: ["https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"],
                        pulumi_policies: [],
                        clouds: []
                    }
                ]
            }
        ]
    },
    "sox": {
        framework: "SOX",
        description: "Sarbanes-Oxley Act",
        version: "2002",
        sections: [
            {
                name: "IT General Controls",
                controls: [
                    {
                        id: "Section 302",
                        title: "Corporate responsibility for financial reports",
                        description: "Principal executive and financial officers must certify the accuracy of financial statements.",
                        compliance_level: "required",
                        automation_possible: true,
                        verification_method: "automated",
                        references: ["https://www.sox-online.com/act_section_302.html"],
                        pulumi_policies: [],
                        clouds: []
                    }
                ]
            }
        ]
    },
    "gdpr": {
        framework: "GDPR",
        description: "General Data Protection Regulation",
        version: "2018",
        chapters: [
            {
                name: "Lawfulness of Processing",
                articles: [
                    {
                        id: "Article 6",
                        title: "Lawfulness of processing",
                        description: "Processing shall be lawful only if and to the extent that at least one of the lawful bases applies.",
                        compliance_level: "required",
                        automation_possible: false,
                        verification_method: "manual",
                        references: ["https://gdpr-info.eu/art-6-gdpr/"],
                        pulumi_policies: [],
                        clouds: []
                    }
                ]
            }
        ]
    },
    "fedramp": {
        framework: "FedRAMP",
        description: "Federal Risk and Authorization Management Program",
        version: "Revision 5",
        control_families: [
            {
                name: "Access Control",
                controls: [
                    {
                        id: "AC-2",
                        title: "Account Management",
                        description: "The organization manages information system accounts.",
                        compliance_level: "required",
                        automation_possible: true,
                        verification_method: "automated",
                        references: ["https://www.fedramp.gov/assets/resources/documents/FedRAMP_Security_Controls_Baseline.xlsx"],
                        pulumi_policies: [],
                        clouds: []
                    }
                ]
            }
        ]
    },
    "mcsb": {
        framework: "Microsoft Cloud Security Benchmark v1",
        description: "Microsoft's comprehensive security best practices for cloud environments",
        version: "1.0",
        domains: [
            {
                name: "Network Security",
                controls: [
                    {
                        id: "NS-1",
                        title: "Implement security for internal traffic",
                        description: "Ensure that all Azure virtual networks are protected with network security groups that are configured with rules specific to the applications and services.",
                        compliance_level: "required",
                        automation_possible: true,
                        verification_method: "automated",
                        references: ["https://docs.microsoft.com/en-us/security/benchmark/azure/overview"],
                        pulumi_policies: [],
                        clouds: []
                    }
                ]
            }
        ]
    }
};

// Generate each framework file
for (const [frameworkId, frameworkData] of Object.entries(frameworks)) {
    const filename = `framework-${frameworkId}.json`;
    const filepath = path.join(__dirname, 'data', filename);
    
    console.log(`Generating ${filename}...`);
    
    try {
        fs.writeFileSync(filepath, JSON.stringify(frameworkData, null, 4));
        console.log(`✓ Created ${filename}`);
    } catch (error) {
        console.error(`✗ Failed to create ${filename}:`, error.message);
    }
}

console.log('\nGeneration complete!');
console.log('\nNext steps:');
console.log('1. Review each generated file');
console.log('2. Add complete control structures for each framework');
console.log('3. Map existing Pulumi policies to appropriate controls');
console.log('4. Add cloud-specific recommendations');
console.log('5. Update the framework index file');

// Generate a summary report
const summary = {
    generated: new Date().toISOString(),
    frameworks: Object.keys(frameworks).map(id => ({
        id,
        name: frameworks[id].framework,
        file: `frameworks/data/framework-${id}.json`,
        status: 'template_generated'
    }))
};

fs.writeFileSync(path.join(__dirname, 'generation-summary.json'), JSON.stringify(summary, null, 2));
console.log('\nSummary saved to generation-summary.json');