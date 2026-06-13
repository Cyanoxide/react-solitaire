import { useEffect, useState } from "react";
import Button from "../components/Button/Button";
import WindowMenu from "../components/WindowMenu/WindowMenu";
import type { WindowMenuDef } from "../components/WindowMenu/WindowMenu";
import Card from "./Card/Card";
import styles from "./Solitaire.module.scss";
import WinAnimation from "./WinAnimation/WinAnimation";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface CardType {
    id: string;
    suit: Suit;
    rank: Rank;
    isFaceUp: boolean;
}

export interface BoardState {
  deck: CardType[];
  waste: CardType[];
  wasteCount: number;
  foundations: CardType[][];
  board: CardType[][];
  win: boolean;
}

const shuffle = (array: CardType[]) => {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
const deck: CardType[] = suits.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({
        id: `${suit}-${i + 1}`,
        suit,
        rank: (i + 1) as Rank,
        isFaceUp: false,
    }))
);

const createInitialBoardState = (): BoardState => {
    const shuffledDeck = shuffle(deck);

    const board: CardType[][] = Array.from({ length: 7 }, (_, i) => {
        const start = (i * (i + 1)) / 2;
        const end = start + (i + 1);

        return shuffledDeck.slice(start, end).map((card, index) => ({
            ...card,
            isFaceUp: index === i
        }));
    });

    return {
        deck: shuffledDeck.slice(28),
        waste: [],
        wasteCount: 3,
        foundations: [
            [],
            [],
            [],
            [],
        ],
        board,
        win: false
    };
};

const Solitaire = () => {
    const [boardState, setBoardState] = useState<BoardState>(createInitialBoardState);
    const [showDealPrompt, setShowDealPrompt] = useState(false);
    // Applied options, plus the Options dialog's pending (unsaved) selections
    const [drawCount, setDrawCount] = useState<1 | 3>(1);
    const [scoring, setScoring] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [pendingDraw, setPendingDraw] = useState<1 | 3>(1);
    const [pendingScoring, setPendingScoring] = useState(false);

    // Latch the win once every foundation is complete. It must be state, not a
    // derived value: the win animation pops the foundations as it plays, so a
    // derived flag would flip back to false the moment the first card launches.
    useEffect(() => {
        if (!boardState.foundations || boardState.win) return;
        if (boardState.foundations.every((foundation) => foundation.length === 13)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBoardState((prev) => ({ ...prev, win: true }));
        }
    }, [boardState.foundations, boardState.win]);

    if (!boardState.board) return;

    const handleDeckOnClick = () => {
        setBoardState((prev: BoardState) => {
            if (prev.deck.length) {
                // Draw `drawCount` cards at once (Options: Draw one / Draw three)
                const count = Math.min(drawCount, prev.deck.length);
                const drawn = prev.deck.slice(prev.deck.length - count);
                return {
                    ...prev,
                    deck: prev.deck.slice(0, prev.deck.length - count),
                    waste: [...prev.waste, ...drawn],
                    wasteCount: drawCount,
                };
            }

            return {
                ...prev,
                deck: prev.waste.slice().reverse(),
                waste: []
            };
        });
    };

    const handleCardLaunch = (pileIndex: number) => {
        setBoardState((prev) => ({
            ...prev,
            foundations: prev.foundations.map((foundation, index) =>
                (index === pileIndex) ? foundation.slice(0, -1) : foundation
            ),
        }));
    };

    const handleNewGame = () => {
        setShowDealPrompt(false);
        setBoardState(createInitialBoardState());
    };

    // Animation finished or was skipped: leave the table empty and ask to deal again
    const handleAnimationComplete = () => {
        setBoardState((prev) => ({
            ...prev,
            foundations: [[], [], [], []],
            win: false,
        }));
        setShowDealPrompt(true);
    };

    // Menu definitions. Items are wired up on their own branches; for now the
    // dropdowns open with every option greyed out.
    const menus: WindowMenuDef[] = [
        {
            label: "Game",
            items: [
                { label: "Deal", shortcut: "F2", disabled: true },
                { label: "Undo", disabled: true },
                { separator: true },
                { label: "Deck...", disabled: true },
                { label: "Options...", onClick: () => { setPendingDraw(drawCount); setPendingScoring(scoring); setOptionsOpen(true); } },
                { separator: true },
                { label: "Exit", disabled: true },
            ],
        },
        {
            label: "Help",
            items: [
                { label: "Contents", disabled: true },
                { label: "Search for Help on...", disabled: true },
                { label: "Using Help", disabled: true },
                { separator: true },
                { label: "About Solitaire", disabled: true },
            ],
        },
    ];

    return (
        <>
            <WindowMenu menus={menus}/>
            <div className={styles.solitaire}>
                <main className={styles.main}>
                    <div className={styles.topRow}>
                        <div className={styles.pileRow}>
                            <div className={styles.deck} onClick={handleDeckOnClick}>
                                {boardState.deck.slice(0, 3).map((card) => <Card key={card.id} {...card}/>)}
                            </div>
                            <div className={styles.waste}>
                                {boardState.waste.slice(-Math.abs(boardState.wasteCount)).map((card) => <Card key={card.id} rank={card.rank} suit={card.suit} isFaceUp={true} setBoardState={setBoardState}/>)}
                            </div>
                        </div>
                        <div className={styles.foundations}>
                            {boardState.foundations.map((item, index) => (
                                <div key={index} data-foundation={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={setBoardState} {...card}/>)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.columns}>
                        {boardState.board.map((item, index) => {
                            return (
                                <div key={index} className={styles.column} data-column={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={setBoardState} {...card}/>)}
                                </div>
                            );
                        })}
                    </div>
                </main>
                {boardState.win && <WinAnimation foundations={boardState.foundations} onCardLaunch={handleCardLaunch} onComplete={handleAnimationComplete} />}
                {scoring && (
                    <div className={styles.statusBar}>Score: {boardState.foundations.reduce((total, foundation) => total + foundation.length, 0) * 5}</div>
                )}
                {showDealPrompt && (
                    <div className={styles.dialog}>
                        <div className={styles.dialogTitleBar}>Solitaire</div>
                        <div className={`${styles.dialogBody} ${styles.dealPromptBody}`}>
                            <p>Do you want to deal again?</p>
                            <div className={styles.dialogButtons}>
                                <Button onClick={handleNewGame}>Yes</Button>
                                <Button onClick={() => setShowDealPrompt(false)}>No</Button>
                            </div>
                        </div>
                    </div>
                )}
                {optionsOpen && (
                    <div className={styles.dialog}>
                        <div className={styles.dialogTitleBar}>
                            <span>Options</span>
                            <button type="button" className={styles.dialogClose} aria-label="Close" onClick={() => setOptionsOpen(false)}>Close</button>
                        </div>
                        <div className={styles.dialogBody}>
                            <div className={styles.optionGroups}>
                                <div className={styles.optionGroup}>
                                    <span className={styles.optionGroupLabel}>Draw</span>
                                    <label className={styles.optionRow}><input type="radio" name="draw" checked={pendingDraw === 1} onChange={() => setPendingDraw(1)} /><span>Draw One</span></label>
                                    <label className={styles.optionRow}><input type="radio" name="draw" checked={pendingDraw === 3} onChange={() => setPendingDraw(3)} /><span>Draw Three</span></label>
                                </div>
                                <div className={styles.optionGroup}>
                                    <span className={styles.optionGroupLabel}>Scoring</span>
                                    <label className={styles.optionRow}><input type="checkbox" checked={pendingScoring} onChange={(event) => setPendingScoring(event.target.checked)} /><span>Standard</span></label>
                                </div>
                            </div>
                            <div className={styles.dialogButtons}>
                                <Button data-primary onClick={() => { setDrawCount(pendingDraw); setScoring(pendingScoring); setOptionsOpen(false); }}>OK</Button>
                                <Button onClick={() => setOptionsOpen(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Solitaire;
