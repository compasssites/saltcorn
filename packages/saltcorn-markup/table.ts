/**
 * @category saltcorn-markup
 * @module table
 */

import tags = require("./tags");
const { a, td, tr, th, text, div, table, thead, tbody, ul, li, span, h4 } =
  tags;
import helpers = require("./helpers");
import type { SearchBarOpts, RadioGroupOpts } from "./helpers";
const { pagination } = helpers;

/**
 * @param {any} hdr
 * @returns {th}
 */
const headerCell = (hdr: any): string =>
  th(
    (hdr.align || hdr.width) && {
      style:
        (hdr.align ? `text-align: ${hdr.align};` : "") +
        (hdr.width ? `width: ` + hdr.width : ""),
    },
    hdr.sortlink
      ? span({ onclick: hdr.sortlink, class: "link-style" }, hdr.label)
      : hdr.label
  );

// declaration merging
namespace TableExports {
  export type HeadersParams = {
    label: string;
    key: string | Function;
    width?: string;
    align?: string;
  };

  export type OptsParams = {
    pagination?: {
      current_page: number;
      pages: number;
      get_page_link: Function;
    };
    noHeader?: boolean;
    hover?: boolean;
    transpose?: boolean;
    tableClass?: string;
    tableId?: string;
    grouped?: string;
  };
}
type HeadersParams = TableExports.HeadersParams;
type OptsParams = TableExports.OptsParams;

/**
 * @function
 * @param {object[]} hdrs
 * @param {object[]} vs
 * @param {object} [opts]
 * @returns {string}
 */
const transposedBody = (
  hdrs: HeadersParams[],
  vs: any[],
  opts: OptsParams | any = {}
): string[] =>
  hdrs.map((hdr: HeadersParams, ix) =>
    tr(
      !opts.noHeader && th(hdr.label),
      (vs || []).map((v: any) =>
        td(
          ix === 0 && opts.transpose_width
            ? {
                style: {
                  width: `${opts.transpose_width}${opts.transpose_width_units}`,
                },
              }
            : null,
          typeof hdr.key === "string" ? text(v[hdr.key]) : hdr.key(v)
        )
      )
    )
  );

/**
 * @function
 * @param {object[]} hdrs
 * @param {object[]} vs
 * @param {object} [opts]
 * @returns {string}
 */
const mkTable = (
  hdrs: HeadersParams[],
  vs: any[],
  opts: OptsParams | any = {}
): string => {
  const val_row = (v: any) =>
    tr(
      mkClickHandler(opts, v),
      hdrs.map((hdr: HeadersParams) =>
        td(
          {
            style: {
              ...(hdr.align ? { "text-align": hdr.align } : {}),
              ...(hdr.width && opts.noHeader ? { width: hdr.width } : {}),
            },
          },
          typeof hdr.key === "string" ? text(v[hdr.key]) : hdr.key(v)
        )
      )
    );
  const groupedBody = (groups: any) =>
    Object.entries(groups).map(
      ([group, rows]: [string, any]) =>
        tr(td({ colspan: "1000" }, h4({ class: "list-group-header" }, group))) +
        rows.map(val_row).join("")
    );
  return div(
    {
      class: ["table-responsive", opts.tableClass],
      id: opts.tableId,
    },
    table(
      {
        class: [
          "table table-sm",
          opts.class,
          hdrs.some((h: HeadersParams) => h.width) && "table-layout-fixed",
          (opts.onRowSelect || (opts.hover && vs && vs.length > 1)) &&
            "table-hover",
        ],
        style: opts.style,
      },
      !opts.noHeader &&
        !opts.transpose &&
        thead(tr(hdrs.map((hdr: HeadersParams) => headerCell(hdr)))),
      tbody(
        opts.transpose
          ? transposedBody(hdrs, vs, opts)
          : opts.grouped
          ? groupedBody(vs)
          : (vs || []).map(val_row)
      )
    ),
    opts.pagination && pagination(opts.pagination)
  );
};

/**
 * @param {object} opts
 * @param {object} v
 * @returns {object}
 */
const mkClickHandler = (opts: any, v: any): any => {
  var attrs: any = {};
  if (opts.onRowSelect)
    attrs.onclick =
      typeof opts.onRowSelect === "function"
        ? opts.onRowSelect(v)
        : opts.onRowSelect;
  if (opts.selectedId && v.id && +v.id === +opts.selectedId)
    attrs.class = "table-active";
  return attrs;
};

// declaration merging
const TableExports = mkTable;
export = TableExports;
