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

    expect(exprex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOOFOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOOBAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    expect(exprex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

    expect(exprex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
  });

  it("matches a sequence of symbols", () => {
    const expressionMap = new Map();

    const exprex = new ExpRex("FOO BAR", tokenMap, expressionMap);

    expect(exprex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 4,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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

    expect(exprex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

    expect(exprex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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

    expect(exprex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 0,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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

      expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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

      expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 0,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("FOO FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 4,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 4,
      "message": "Fizz expression",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "Fizz expression",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR FOO FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 4,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 7,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
    Object {
      "expectant": "test",
      "index": 3,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
    Object {
      "expectant": "test",
      "index": 3,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 7,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 7,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

        expect(rex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
    Object {
      "expectant": "test",
      "index": 3,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 3,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 7,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 7,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
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
        expect(rex.match("BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);

        expect(rex.match("FOO BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
        expect(rex.match("FOO BAR BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

        expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
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
  "promotedMatch": Array [],
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

        expect(rex.match("FOO BAR FOO", "test")).toMatchSnapshot();
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
        expect(rex.match("FOO BAR FOO", "test")).toMatchSnapshot();
      });

      it("promotes marked expressions", () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set("Fizz", {
          name: "Fizz",
          groups: [new ExpRex("FOO", tokenMap, expressionMap)]
        });

        expressionMap.set("Buzz", {
          name: "Buzz",
          groups: [new ExpRex("(?<@fizz>Fizz)", tokenMap, expressionMap)]
        });

        const rex = new ExpRex("(?<value>Buzz)", tokenMap, expressionMap);

        expect(rex.match("FOO", "test")).toMatchSnapshot();
      });
    });
  });

  describe("ORs", () => {
    it("matches a OR b", () => {
      const rex = new ExpRex("FOO|BAR", tokenMap, new Map());
      expect(rex.match("", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [
    Object {
      "expectant": "test",
      "index": 0,
      "message": "FOO token",
    },
    Object {
      "expectant": "test",
      "index": 0,
      "message": "BAR token",
    },
  ],
  "isCompleteMatch": false,
  "promotedMatch": Array [],
  "text": "",
  "tokens": Array [],
}
`);
      expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BUZZ", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

      expect(rex.match("FOO BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO BUZZ", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BUZZ FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO BUZZ", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BAR BUZZ", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BUZZ", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BAR", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("FIZZ FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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
      expect(rex.match("BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

  describe("left recursive", () => {
    it("does not infinitely recurse a simple left-recursive expression", () => {
      const expressionMap: Map<string, Expression> = new Map();
      expressionMap.set("Fizz", {
        name: "Fizz",
        groups: [
          new ExpRex("Fizz FOO", tokenMap, expressionMap),
          new ExpRex("FOO", tokenMap, expressionMap)
        ]
      });

      const exprex = new ExpRex("Fizz", tokenMap, expressionMap);

      expect(exprex.match("FOO FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    it("finds a full expression on both sides", () => {
      const expressionMap: Map<string, Expression> = new Map();
      expressionMap.set("Expression", {
        name: "Expression",
        groups: [
          new ExpRex("Buzz", tokenMap, expressionMap),
          new ExpRex("FOO", tokenMap, expressionMap)
        ]
      });
      expressionMap.set("Buzz", {
        name: "Buzz",
        groups: [
          new ExpRex("Expression BAR Expression", tokenMap, expressionMap)
        ]
      });

      const exprex = new ExpRex("Expression", tokenMap, expressionMap);

      expect(exprex.match("FOO BAR FOO", "test")).toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
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

    it("walks nested expressions", () => {
      const expressionMap: Map<string, Expression> = new Map();
      expressionMap.set("Expression", {
        name: "Expression",
        groups: [
          new ExpRex("Buzz", tokenMap, expressionMap),
          new ExpRex("FOO", tokenMap, expressionMap)
        ]
      });
      expressionMap.set("Buzz", {
        name: "Buzz",
        groups: [
          new ExpRex("Expression BAR Expression", tokenMap, expressionMap)
        ]
      });

      const exprex = new ExpRex("Expression", tokenMap, expressionMap);

      expect(exprex.match("FOO BAR FOO BAR FOO", "test"))
        .toMatchInlineSnapshot(`
Object {
  "captures": Object {},
  "expected": Array [],
  "isCompleteMatch": true,
  "promotedMatch": Array [],
  "text": "FOO BAR FOO BAR FOO",
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
      "lexeme": "FOO",
      "location": Object {
        "end": Object {
          "index": 19,
        },
        "start": Object {
          "index": 16,
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

  describe("pathological cases", () => {
    const input =
      "FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO FOO BAR";

    it("(FOO+)+", () => {
      expect(
        timeMe(() => {
          new ExpRex("(FOO+)+", tokenMap, new Map()).match(input, "test");
        })
      ).toBeLessThan(10);
    });

    it("([FOO]+)*", () => {
      expect(
        timeMe(() => {
          new ExpRex("(FOO+)*", tokenMap, new Map()).match(input, "test");
        })
      ).toBeLessThan(10);
    });

    it("(FOO|FOO FOO)+", () => {
      expect(
        timeMe(() => {
          new ExpRex("(FOO|FOO FOO)+", tokenMap, new Map()).match(
            input,
            "test"
          );
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
