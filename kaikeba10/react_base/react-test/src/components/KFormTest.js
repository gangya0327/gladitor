import React from "react";

// 高阶组件：扩展现有表单，提供控件包装，事件处理，表单校验
function kFormCreate(Comp) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      // 选项
      this.options = {};
      // 数据
      this.state = {};
    }
    handleChange = e => {
      // 数据的设置和校验
      const { name, value } = e.target.value;
      this.setState({ [name]: value }, () => {
        // 单字段校验
        this.validateField(name);
      });
    };

    validateField = field => {
      const rules = this.options;
      // some里任何一项不通过就会返回true跳出，取反表示校验失败
      const isValid = !rules.some(rule => {
        if (rule.required) {
          if (!this.state[field]) {
            // 校验失败
            this.setState({
              [field + "Message"]: rule.message
            });
            return true;
          }
        }
        return false;
      });
      if (isValid) {
        this.setState({
          [field + "Message"]: ""
        });
      }
      return isValid;
    };

    validateFields = cb => {
      const rets = Object.keys(this.options).map(field => {
        this.validateField(field);
      });
      const ret = rets.every(v => v === true);
    };

    // 包装函数：接收字段名和校验选项，返回一个高阶组件
    getFieldDec = (field, option) => {
      this.options[field] = option; // 选项告诉我们如何校验
      return InputComp => (
        <div>
          {React.cloneElement(InputComp, {
            name: field,
            value: this.state[field] || "",
            onChange: this.handleChange // 执行校验设置状态
          })}
        </div>
      );
    };
    render() {
      return (
        <Comp
          getFieldDec={this.getFieldDec}
          validateFields={this.validateFields}
        ></Comp>
      );
    }
  };
}

@kFormCreate
class KFormTest extends React.Component {
  onSubmit = () => {
    this.props.validateFields((isValid, values) => {});
  };
  render() {
    const { getFieldDec } = this.props;
    return (
      <div>
        <div>
          {getFieldDec("username", {
            rules: [{ required: true, message: "input your username" }]
          })(<input type="text" />)}
        </div>
        <div>
          {getFieldDec("password", {
            rules: [{ required: true, message: "input your password" }]
          })(<input type="password" />)}
        </div>
        <button onClick={this.onSubmit}>登陆</button>
      </div>
    );
  }
}
export default KFormTest;
