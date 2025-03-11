/*!
 * koa-parameter - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

import { Context } from "koa";

/**
 * Module dependencies.
 */

import Parameter from "parameter";

import ErrorCode from "../constants/ErrorCode";

export default function (app: any, translate: any = null) {
    let parameter;

    if (typeof translate === "function") {
        parameter = new Parameter({
            translate
        });
    } else {
        parameter = new Parameter();
    }

    app.context.verifyParams = function (rules: any, params: any) {
        if (!rules) {
            return;
        }

        if (!params) {
            params = ["GET", "HEAD"].includes(this.method.toUpperCase())
                ? this.request.query
                : this.request.body;

            // copy
            params = Object.assign({}, params, this.params);
        }
        const errors = parameter.validate(rules, params);
        if (!errors) {
            return;
        }
        console.log("参数校验失败:", errors)

        this.throw(422, "参数校验失败", {
            code: "INVALID_PARAM",
            errors: errors,
            params: params,
            rules: rules
        });
    };

    return async function verifyParam(ctx: Context, next: Function) {
        try {
            await next();
        } catch (e) {
            const err: any = e;
            if (err?.code === "INVALID_PARAM") {
                ctx.status = 422;
                let message = "参数校验失败";
                // 将err.errors数组中的message拼接成字符串
                if (err?.errors) {
                    message += ": " + err?.errors?.map((e: any) => e.message).join(",");
                }
                ctx.status = 422;
                ctx.body = {
                    code: ErrorCode.PARAMS_ILLEGAL.code,
                    message: message,
                    errors: err?.errors,
                    params: err?.params
                };
                return;
            }
            throw err;
        }
    };
};