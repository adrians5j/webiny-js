import React from "react";
import { Input } from "../index";
import "jest-dom/extend-expect";
import { render, cleanup } from "@testing-library/react";

afterEach(cleanup);

interface SetupProps {
    onChange?: () => void;
}
function setup(props: SetupProps = {}) {
    const renderArg = {
        // eslint-disable-next-line
        onChange: (_: string) => {},
        value: null
    };
    const renderProp = jest.fn(controllerArg => {
        Object.assign(renderArg, controllerArg);
        return null;
    });

    const onChange = props.onChange
        ? props.onChange
        : () => {
              return void 0;
          };

    class Test extends React.Component {
        public override state = { value: "init-value" };

        onChange = (value: string) => {
            this.setState({ value });
        };

        public override render() {
            return (
                <Input
                    {...props}
                    value={this.state.value}
                    onChange={callAll(onChange, this.onChange)}
                >
                    {renderProp}
                </Input>
            );
        }
    }

    const utils = render(<Test />);

    return { renderArg, ...utils };
}

/**
 * This return a function that will call all the given functions with
 * the arguments with which it's called. It does a null-check before
 * attempting to call the functions and can take any number of functions.
 * @param {...Function} fns the functions to call
 * @return {Function} the function that calls all the functions
 */
function callAll(...fns: Function[]) {
    return (...args: any) => {
        fns.forEach(fn => {
            fn && fn(...args);
        });
    };
}

describe("Input tests", () => {
    test("passes expected props to render prop", () => {
        const { renderArg } = setup();

        // @ts-ignore
        expect(renderArg).toContainKeys(["value", "validation", "onChange", "onBlur"]);
    });

    test("updates value via onChange", () => {
        const { renderArg } = setup();
        expect(renderArg.value).toBe("init-value");
        renderArg.onChange("new-value");
        expect(renderArg.value).toBe("new-value");
        renderArg.onChange("third-value");
        expect(renderArg.value).toBe("third-value");
    });
});
