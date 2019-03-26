import ExpRex, { TokenMap } from "./ExpRex";
import { Expression } from "../Parser";
import Rex from "@sagebrush/rex";

const tokenMap: TokenMap = new Map();
tokenMap.set("FOO", new Rex("^FOO"));
tokenMap.set("BAR", new Rex("^BAR"));
tokenMap.set("BUZZ", new Rex("^BUZZ"));
tokenMap.set("FIZZ", new Rex("^FIZZ"));

describe("ExpRex", () => {
  it("matches a simple symbol", () => {
    const expressionMap = new Map();

    const exprex = new ExpRex("FOO", tokenMap, expressionMap);

    expect(exprex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("FOOFOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("FOOBAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

    expect(exprex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
  });

  it("matches a sequence of symbols", () => {
    const expressionMap = new Map();

    const exprex = new ExpRex("FOO BAR", tokenMap, expressionMap);

    expect(exprex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 4,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

    expect(exprex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

    expect(exprex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
  });

  it("matches an expression", () => {
    const expressionMap: Map<string, Expression> = new Map();
    expressionMap.set("Fizz", {
      name: "Fizz",
      groups: [new ExpRex("FOO BAR", tokenMap, expressionMap)]
    });

    const exprex = new ExpRex("Fizz", tokenMap, expressionMap);

    expect(exprex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
  });

  describe("zero-or-more", () => {
    it("matches a repeated character at the end", () => {
      const rex = new ExpRex("FOO BAR*", tokenMap, new Map());

      expect(rex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
    });

    it("matches a repeated character in the middle", () => {
      const rex = new ExpRex("FOO* BAR", tokenMap, new Map());

      expect(rex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
    Object {
      "index": 0,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "FOO token",
    },
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

      expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
    });
  });

  describe("one-or-more", () => {
    it("matches a repeated character", () => {
      const rex = new ExpRex("FOO+", tokenMap, new Map());

      expect(rex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
    });

    it("matches a repeated character in the middle", () => {
      const rex = new ExpRex("FOO+ BAR", tokenMap, new Map());

      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "FOO token",
    },
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

      expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
    });
  });

  describe("zero-or-one", () => {
    it("matches a repeated character", () => {
      const rex = new ExpRex("FOO?", tokenMap, new Map());

      expect(rex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
    });

    it("matches a repeated character in the middle", () => {
      const rex = new ExpRex("FOO? BAR", tokenMap, new Map());

      expect(rex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
    Object {
      "index": 0,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);

      expect(rex.match("FOO FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 4,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
    });
  });

  describe("non-greedy matchers", () => {
    describe("non-greedy zero-or-more", () => {
      it("matches simple zero-or-more", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [
            new ExpRex("FOO", tokenMap, expressionMap),
            new ExpRex("BAR", tokenMap, expressionMap)
          ]
        });

        const rex = new ExpRex("FOO Fizz*? BAR", tokenMap, expressionMap);
        expect(rex.match("FOO FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches zero length zero-or-more", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [
            new ExpRex("FOO", tokenMap, expressionMap),
            new ExpRex("BAR", tokenMap, expressionMap)
          ]
        });

        const rex = new ExpRex("Fizz*? FOO FOO", tokenMap, expressionMap);

        expect(rex.match("FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      });
    });

    describe("non-greedy one-or-more", () => {
      it("matches simple one-or-more", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [
            new ExpRex("FOO", tokenMap, expressionMap),
            new ExpRex("BAR", tokenMap, expressionMap)
          ]
        });

        const rex = new ExpRex("FOO Fizz+? FOO", tokenMap, expressionMap);
        expect(rex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 4,
      "message": "Fizz expression",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches one length one-or-more", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [
            new ExpRex("FOO", tokenMap, expressionMap),
            new ExpRex("BAR", tokenMap, expressionMap)
          ]
        });

        const rex = new ExpRex("Fizz+? FOO FOO", tokenMap, expressionMap);

        expect(rex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "Fizz expression",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR FOO FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      });

      it("tracks two non-greedy one-or-more matchers", () => {
        const rex = new ExpRex("FOO+? BAR+?", tokenMap, new Map());
        expect(rex.match("FOO FOO FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 15,
        },
        "start": Object {
          "index": 12,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("works alongside greedy matchers", () => {
        const rex = new ExpRex("FOO+? BAR+", tokenMap, new Map());
        expect(rex.match("FOO FOO FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO FOO BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 15,
        },
        "start": Object {
          "index": 12,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 19,
        },
        "start": Object {
          "index": 16,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });
    });
  });

  describe("groups", () => {
    describe("matches a group", () => {
      it("matches a standalone group", () => {
        const rex = new ExpRex("(FOO BAR+)", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches a group at the beginning", () => {
        const rex = new ExpRex("(FOO) BAR", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches a group at the end", () => {
        const rex = new ExpRex("FOO (BAR)", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches a group in the middle", () => {
        const rex = new ExpRex("FOO (BAR) FOO", tokenMap, new Map());

        expect(rex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 4,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 7,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      });
    });

    describe("optional groups", () => {
      it("matches zero or more groups in the beginning", () => {
        const rex = new ExpRex("(FOO)* BAR", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
    Object {
      "index": 3,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches zero or more groups at the end", () => {
        const rex = new ExpRex("FOO (BAR)*", tokenMap, new Map());

        expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches zero or more groups in the middle", () => {
        const rex = new ExpRex("FOO (BAR)* FOO", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
    Object {
      "index": 3,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 7,
      "message": "FOO token",
    },
    Object {
      "index": 7,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

        expect(rex.match("FOO FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      });
    });

    describe("one-or-more groups", () => {
      it("matches one or more groups in the beginning", () => {
        const rex = new ExpRex("(FOO)+ BAR", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
    Object {
      "index": 3,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches one or more groups at the end", () => {
        const rex = new ExpRex("FOO (BAR)+", tokenMap, new Map());

        expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);

        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 15,
        },
        "start": Object {
          "index": 12,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 15,
        },
        "start": Object {
          "index": 12,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("matches one or more groups in the middle", () => {
        const rex = new ExpRex("FOO (BAR)+ FOO", tokenMap, new Map());

        expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 7,
      "message": "FOO token",
    },
    Object {
      "index": 7,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);

        expect(rex.match("FOO BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
        expect(rex.match("FOO BAR BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR BAR FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 11,
        },
        "start": Object {
          "index": 8,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 15,
        },
        "start": Object {
          "index": 12,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      });
    });

    it("throws an error when parenthesis are unbalanced", () => {
      expect(() => {
        new ExpRex("(FOO", tokenMap, new Map());
      }).toThrowErrorMatchingInlineSnapshot(`"Unbalanced parentheses"`);
      expect(() => {
        new ExpRex("(FO(O)", tokenMap, new Map());
      }).toThrowErrorMatchingInlineSnapshot(`"Unbalanced parentheses"`);

      expect(() => {
        new ExpRex("FOO)", tokenMap, new Map());
      }).toThrowErrorMatchingInlineSnapshot(`"Unexpected token \\")\\""`);
      expect(() => {
        new ExpRex("(FOO))", tokenMap, new Map());
      }).toThrowErrorMatchingInlineSnapshot(`"Unexpected token \\")\\""`);
    });

    describe("capturing", () => {
      it("records the matched tokens in a named group", () => {
        const rex = new ExpRex("FOO (?<bar>BAR)+", tokenMap, new Map());

        expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {
    "bar": Array [
      Object {
        "token": Token {
          "lexeme": "BAR",
          "location": Object {
            "end": Object {
              "index": 7,
            },
            "start": Object {
              "index": 4,
            },
          },
          "type": "BAR",
          "values": Object {},
        },
      },
    ],
  },
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BAR",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 7,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      });

      it("records the matched expressions in a named group", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [
            new ExpRex("FOO", tokenMap, expressionMap),
            new ExpRex("BAR", tokenMap, expressionMap)
          ]
        });

        const rex = new ExpRex("FOO (?<fizz>Fizz)+", tokenMap, expressionMap);

        expect(rex.match("FOO BAR FOO")).toMatchSnapshot();
      });

      it("records nested matched expressions in a named group", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [
            new ExpRex("FOO", tokenMap, expressionMap),
            new ExpRex("BAR", tokenMap, expressionMap)
          ]
        });

        expressionMap.set("Buzz", {
          name: "Buzz",
          groups: [new ExpRex("Fizz", tokenMap, expressionMap)]
        });

        const rex = new ExpRex("FOO (?<buzz>Buzz)+", tokenMap, expressionMap);
        expect(rex.match("FOO BAR FOO")).toMatchSnapshot();
      });
    });
  });

  describe("ORs", () => {
    it("matches a OR b", () => {
      const rex = new ExpRex("FOO|BAR", tokenMap, new Map());
      expect(rex.match("")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "index": 0,
      "message": "FOO token",
    },
    Object {
      "index": 0,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
    });

    it("matches foo OR bar OR buzz", () => {
      const rex = new ExpRex("FOO|BAR|BUZZ", tokenMap, new Map());
      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BUZZ")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BUZZ",
  "tokens": Array [
    Token {
      "lexeme": "BUZZ",
      "location": Object {
        "end": Object {
          "index": 4,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BUZZ",
      "values": Object {},
    },
  ],
}
`);

      expect(rex.match("FOO BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FOO BUZZ")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BUZZ FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BUZZ",
  "tokens": Array [
    Token {
      "lexeme": "BUZZ",
      "location": Object {
        "end": Object {
          "index": 4,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BUZZ",
      "values": Object {},
    },
  ],
}
`);
    });
  });

  describe("match beginning", () => {
    it("binds the matcher to the start of the input", () => {
      const rex = new ExpRex("(FOO|BAR)BUZZ", tokenMap, new Map());
      expect(rex.match("FOO BUZZ")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO BUZZ",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
    Token {
      "lexeme": "BUZZ",
      "location": Object {
        "end": Object {
          "index": 8,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BUZZ",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BAR BUZZ")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR BUZZ",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
    Token {
      "lexeme": "BUZZ",
      "location": Object {
        "end": Object {
          "index": 8,
        },
        "start": Object {
          "index": 4,
        },
      },
      "type": "BUZZ",
      "values": Object {},
    },
  ],
}
`);
    });
  });

  describe("complex", () => {
    it("matches a nested group", () => {
      const rex = new ExpRex("((FOO|BUZZ)|BAR)|FIZZ", tokenMap, new Map());
      expect(rex.match("FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FOO",
  "tokens": Array [
    Token {
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FOO",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BUZZ")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BUZZ",
  "tokens": Array [
    Token {
      "lexeme": "BUZZ",
      "location": Object {
        "end": Object {
          "index": 4,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BUZZ",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BAR")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("FIZZ FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "FIZZ",
  "tokens": Array [
    Token {
      "lexeme": "FIZZ",
      "location": Object {
        "end": Object {
          "index": 4,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "FIZZ",
      "values": Object {},
    },
  ],
}
`);
      expect(rex.match("BAR FOO")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "text": "BAR",
  "tokens": Array [
    Token {
      "lexeme": "BAR",
      "location": Object {
        "end": Object {
          "index": 3,
        },
        "start": Object {
          "index": 0,
        },
      },
      "type": "BAR",
      "values": Object {},
    },
  ],
}
`);
    });
  });

  describe("pathological cases", () => {
    const input =
      "FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO BAR";

    it("(FOO+)+", () => {
      expect(
        timeMe(() => {
          new ExpRex("(FOO+)+", tokenMap, new Map()).match(input);
        })
      ).toBeLessThan(10);
    });

    it("([FOO]+)*", () => {
      expect(
        timeMe(() => {
          new ExpRex("(FOO+)*", tokenMap, new Map()).match(input);
        })
      ).toBeLessThan(10);
    });

    it("(FOO|FOO FOO)+", () => {
      expect(
        timeMe(() => {
          new ExpRex("(FOO|FOO FOO)+", tokenMap, new Map()).match(input);
        })
      ).toBeLessThan(10);
    });
  });
});

function timeMe(fn: () => void) {
  const start = Date.now();
  fn();
  const end = Date.now();
  return end - start;
}
