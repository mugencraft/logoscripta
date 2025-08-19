#!/usr/bin/env node

import { createCLI } from "./interfaces/cli";

const program = createCLI();
program.parse(process.argv);
