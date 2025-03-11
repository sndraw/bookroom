import '@umijs/max/typings';
// bookroom-web/src/README.d.ts
declare module '*.md' {
    const content: string;
    export default content;
  }