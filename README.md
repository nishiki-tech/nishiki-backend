# Nishiki Backend

This is the Nishiki's backend repository.

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