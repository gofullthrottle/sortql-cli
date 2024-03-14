import chalk from "chalk";

import { Query } from "@sortql/core/queries";
import { Target } from "@sortql/core/parsers";
import { LogicalCondition } from "@sortql/core/filter";

export class SelectQuery extends Query {
  constructor(
    directory: string,
    target: Target,
    from: string,
    where?: LogicalCondition
  ) {
    super(directory, target, from, where);
    this.validate();
  }

  validate() {}

  async execute() {
    const results = await this.filter.apply(this);

    console.log(chalk.yellowBright(`   ↳ [SELECT]: ${results.length}`));
  }
}
