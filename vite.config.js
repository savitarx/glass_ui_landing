var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readBody, toWebRequest, sendWebResponse, } from "./api/node-adapter.mjs";
/**
 * Runs the real /api/inquiry handler during `npm run dev`.
 *
 * Without this, Vite serves only the client, so POST /api/inquiry had nothing
 * behind it and the form failed locally no matter how the mail was configured
 * — indistinguishable from a genuine send failure. Now dev and production go
 * through the same code path.
 */
function apiDev(mode) {
    return {
        name: "invisos-api-dev",
        apply: "serve",
        configureServer: function (server) {
            var _this = this;
            /* Vite only exposes VITE_* to the client, by design. The handler needs
               the SERVER vars (SMTP_USER/PASS, FIREBASE_PROJECT_ID) from .env, so
               load them with an empty prefix and put them on process.env — where the
               handler already looks. Anything already in process.env wins, so a real
               shell variable is never clobbered by the file. */
            var env = loadEnv(mode, process.cwd(), "");
            for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
                var _b = _a[_i], k = _b[0], v = _b[1];
                if (!(k in process.env))
                    process.env[k] = v;
            }
            server.middlewares.use("/api/inquiry", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var mod, body, webRes, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            if (req.method !== "POST") {
                                res.writeHead(405, { allow: "POST" }).end();
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, server.ssrLoadModule("/api/inquiry.ts")];
                        case 1:
                            mod = _a.sent();
                            return [4 /*yield*/, readBody(req)];
                        case 2:
                            body = _a.sent();
                            return [4 /*yield*/, mod.default(toWebRequest(req, body, 5175))];
                        case 3:
                            webRes = _a.sent();
                            return [4 /*yield*/, sendWebResponse(res, webRes)];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            err_1 = _a.sent();
                            server.config.logger.error("[api/inquiry] ".concat(String(err_1)));
                            res.writeHead(500, { "content-type": "application/json" });
                            res.end(JSON.stringify({ error: "Server error." }));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
        },
    };
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [react(), apiDev(mode)],
        server: { host: true, port: 5175, allowedHosts: true },
    });
});
