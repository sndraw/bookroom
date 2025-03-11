import Parameter from "parameter"; // 参数校验
const parameter = new Parameter({
  validateRoot: true, // restrict the being validate value must be a object
});

const paramsValidate = (rule = {}, data = {}) => {
  return parameter.validate(rule, data);
};
export default paramsValidate;
