module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "tsconfigRootDir": __dirname,
        "sourceType": "module"
    },
    "plugins": [
        "eslint-plugin-import",
        "@typescript-eslint",
        "header",
        "jsdoc",
        "mocha"
    ],
    "ignorePatterns": [
        "assets/*",
        "bin/**/*.ts",
        ".eslintrc.*"
    ],
    "extends": [
        "plugin:mocha/recommended"
    ],
    "rules": {
        "header/header": [
            2,
            "line",
            [
                {
                    "pattern": "Copyright \\d{4}-\\d{4}, Pulumi Corporation."
                }
            ]
        ],
        "@typescript-eslint/dot-notation": "off",
        "@typescript-eslint/explicit-member-accessibility": [
            "off",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/indent": [
            "error",
            4,
            {
                "FunctionDeclaration": {
                    "parameters": "first"
                },
                "FunctionExpression": {
                    "parameters": "first"
                }
            }
        ],
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/member-ordering": [
            "error",
            {
                "default": [
                   "static-field",
                   "instance-field",
                   "static-method",
                   "instance-method"
                ]
            }
        ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "default",
                "format": null
            }
        ],
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/quotes": [
            "error",
            "double",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "@typescript-eslint/semi": [
            "error"
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "brace-style": "off",
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "curly": "error",
        "default-case": "error",
        "dot-notation": "off",
        "eol-last": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "import/order": "off",
        "indent": "off",
        "jsdoc/check-alignment": 1,
        "jsdoc/check-indentation": 1,
        "jsdoc/check-line-alignment": 1,
        "jsdoc/check-property-names": 1,
        "jsdoc/check-tag-names": [
            "error", {
                "definedTags": [
                    "link",
                    "severity"
                ]
            }
        ],
        "jsdoc/check-types": 1,
        'jsdoc/no-restricted-syntax': [
            'error',
            {
                contexts: [
                    {
                        comment: 'JsdocBlock:not(*:has(JsdocTag[tag=severity]))',
                        context: 'VariableDeclaration',
                        message: '@severity required on each block',
                    },{
                        comment: 'JsdocBlock:not(*:has(JsdocTag[tag=link]))',
                        context: 'VariableDeclaration',
                        message: '@link required on each block',
                    }
                ],
            },
        ],
        "jsdoc/require-description-complete-sentence": 1,
        "jsdoc/require-jsdoc": 1,
        "no-bitwise": "off",
        "no-caller": "error",
        "no-cond-assign": "off",
        "no-console": [
            "error",
            {
                "allow": [
                    "log",
                    "warn",
                    "dir",
                    "timeLog",
                    "assert",
                    "clear",
                    "count",
                    "countReset",
                    "group",
                    "groupEnd",
                    "table",
                    "dirxml",
                    "error",
                    "groupCollapsed",
                    "Console",
                    "profile",
                    "profileEnd",
                    "timeStamp",
                    "context"
                ]
            }
        ],
        "no-debugger": "error",
        "no-dupe-keys": "error",
        "no-empty": "error",
        "no-empty-function": "off",
        "no-eval": "error",
        "no-fallthrough": "error",
        "no-multiple-empty-lines": "off",
        "no-new-wrappers": "error",
        "no-redeclare": "off",
        "no-shadow": "off",
        "no-trailing-spaces": "error",
        "no-underscore-dangle": "off",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-use-before-define": "off",
        "no-var": "error",
        "prefer-const": "error",
        "quotes": "off",
        "radix": "error",
        "semi": "off",
        "spaced-comment": "off",
        "@typescript-eslint/no-redeclare": [
            "error"
        ],
        "mocha/no-setup-in-describe": "off",
        "mocha/max-top-level-suites": "off",
    }
};