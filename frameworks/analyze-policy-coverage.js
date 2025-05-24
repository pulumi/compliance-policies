#!/usr/bin/env node

/**
 * Script to analyze policy coverage across frameworks
 * This helps identify which policies are mapped to framework controls
 */

const fs = require('fs');
const path = require('path');

// Load the framework index
const frameworkIndex = JSON.parse(fs.readFileSync('../frameworks.json', 'utf8'));

// Track policy usage across frameworks
const policyUsage = {};
const frameworkCoverage = {};
const unmappedControls = {};

// Process each framework
for (const [frameworkId, framework] of Object.entries(frameworkIndex.frameworks)) {
    const frameworkFile = path.join('..', framework.file);
    
    if (!fs.existsSync(frameworkFile)) {
        console.log(`Warning: Framework file not found: ${frameworkFile}`);
        continue;
    }
    
    const frameworkData = JSON.parse(fs.readFileSync(frameworkFile, 'utf8'));
    frameworkCoverage[frameworkId] = {
        name: framework.name,
        totalControls: 0,
        mappedControls: 0,
        policies: new Set()
    };
    
    unmappedControls[frameworkId] = [];
    
    // Process domains/requirements
    const domains = frameworkData.domains || frameworkData.requirements || [];
    
    domains.forEach(domain => {
        const controls = domain.controls || [domain];
        
        controls.forEach(control => {
            frameworkCoverage[frameworkId].totalControls++;
            
            const policies = control.pulumi_policies || [];
            
            if (policies.length > 0) {
                frameworkCoverage[frameworkId].mappedControls++;
                
                policies.forEach(policy => {
                    frameworkCoverage[frameworkId].policies.add(policy);
                    
                    if (!policyUsage[policy]) {
                        policyUsage[policy] = {
                            frameworks: [],
                            controls: []
                        };
                    }
                    
                    policyUsage[policy].frameworks.push(frameworkId);
                    policyUsage[policy].controls.push({
                        framework: frameworkId,
                        controlId: control.id,
                        controlTitle: control.title || control.description
                    });
                });
            } else {
                unmappedControls[frameworkId].push({
                    id: control.id,
                    title: control.title || control.description
                });
            }
        });
    });
}

// Generate report
console.log('# Framework Policy Coverage Analysis\n');
console.log('Generated:', new Date().toISOString(), '\n');

console.log('## Framework Coverage Summary\n');
console.log('| Framework | Total Controls | Mapped Controls | Coverage % | Unique Policies |');
console.log('|-----------|----------------|-----------------|------------|-----------------|');

for (const [id, coverage] of Object.entries(frameworkCoverage)) {
    const percentage = ((coverage.mappedControls / coverage.totalControls) * 100).toFixed(1);
    console.log(`| ${coverage.name} | ${coverage.totalControls} | ${coverage.mappedControls} | ${percentage}% | ${coverage.policies.size} |`);
}

console.log('\n## Policy Usage Across Frameworks\n');
console.log('| Policy | Frameworks | Control Count |');
console.log('|--------|------------|---------------|');

const sortedPolicies = Object.entries(policyUsage)
    .sort((a, b) => b[1].frameworks.length - a[1].frameworks.length);

sortedPolicies.forEach(([policy, usage]) => {
    const frameworks = [...new Set(usage.frameworks)].join(', ');
    console.log(`| ${policy} | ${frameworks} | ${usage.controls.length} |`);
});

console.log('\n## Unmapped Controls by Framework\n');

for (const [frameworkId, controls] of Object.entries(unmappedControls)) {
    if (controls.length > 0) {
        console.log(`### ${frameworkCoverage[frameworkId].name}\n`);
        console.log(`Controls without Pulumi policy mappings (${controls.length}):\n`);
        
        controls.slice(0, 10).forEach(control => {
            console.log(`- ${control.id}: ${control.title}`);
        });
        
        if (controls.length > 10) {
            console.log(`- ... and ${controls.length - 10} more\n`);
        }
        console.log('');
    }
}

// Save detailed JSON report
const detailedReport = {
    generated: new Date().toISOString(),
    frameworkCoverage,
    policyUsage,
    unmappedControls
};

fs.writeFileSync('policy-coverage-report.json', JSON.stringify(detailedReport, null, 2));
console.log('\nDetailed report saved to: policy-coverage-report.json');