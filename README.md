# Nishiki Backend

This is the Nishiki's backend repository.

## Structure

| Directory Name | Description                                              | 
|:---------------|:---------------------------------------------------------|
| backend        | Backend code. This directory contains multiple projects. |
| cdk            | CDK code.                                                |

The backend is deployed on the AWS using [AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/).

### Backend Directory

#### Main

The main directory is the main directory literary. That includes domain objects and their use-cases.

[backend/main Readme](./backend/main/README.md)

## Contributing

To contribute this project. Please see the [CONTRIBUTE.md](./docs/CONTRIBUTING.md)

## Format & Lint code

This project adapts [Biome](https://biomejs.dev/) as a formatter. Its config file is *biome.json*.

### CI

When you run the following command, you can check if the cord is following the lint rules.

```bash
$ npx @biomejs/biome ci ./backend ./cdk
```

### Format

When you run the following command, the Biome re-writes your code neatly.

```bash
$ npx @biomejs/biome format ./backend ./cdk --write
```

### Lint

When you run the following command, the Biome re-writes your code neatly.

```bash
$ npx @biomejs/biome lint ./backend ./cdk --apply
```