from collections import Counter, namedtuple
from pprint import pprint


_bline_def = Counter(
    {
        'AB': 2074,
        'H': 556,
        '2B': 130,
        '3B': 3,
        'HR': 103,
        'BB': 239,
        'SO': 573
    }
)

# Format: {event: {state: {outs: [0, 1, 2]}}
_xtrabase_def = {
    '1B': {
        '1B': [0.25, 0.25, 0.25],
        '2B': [0.30, 0.50, 0.75]
    },
    '2B': {
        '1B': [0.15, 0.25, 0.50]
    },
    'OUT': {
        '1B': [0.05, 0.05, 0.00],
        '2B': [0.25, 0.25, 0.00],
        '3B': [0.50, 0.50, 0.00]
    }
}

# Calculated Run Expectancies given a batting line
class RunExpCalc:

    def __init__(self):
        self.bl = _bline_def
        self.xb = _xtrabase_def
        self._outs_9 = 27.0

    def calc_frqs(self, bline: Counter = _bline_def):

        # Calc missing counting stats
        bline['PA'] = bline['AB'] + bline['BB'];
        bline['OBE'] = bline['H'] + bline['BB'];
        bline['OUT'] = bline['PA'] - bline['OBE'];
        bline['1B'] = bline['H'] - sum([bline['2B'], bline['3B'], bline['HR']]);

        # Calc outcome frequencies
        fq = {}
        freq_keys = ['OBE', 'BB', '1B', '2B', '3B', 'HR', 'SO', 'OUT']
        for fk in freq_keys:
            fq[fk] = bline[fk] / bline['PA'] * 1.0;
        fq['PA'] = (fq['OBE'] / fq['OUT']) * self._outs_9 + self._outs_9  # Clever
        # Calc rate stats
        rt = {
            'BBO': 1 - fq['SO'] / fq['OUT'],
            'SLG': sum(list(map(lambda x, y: x * y, [1, 2, 3, 4], [fq['1B'], fq['2B'], fq['3B'], fq['HR']]))) / (1 - fq['BB']),
            'AVG': sum([fq['1B'], fq['2B'], fq['3B'], fq['HR']]) / (1 - fq['BB'])
        }
        return {'fqs': fq, 'rts': rt}

    def re_engine(self):

        # Chance of not scoring from each BaseOut state
        fqrts = self.calc_frqs()
        xb = self.xb

        # Construct XScoreProb Matrix as a dictionary
        ld_bsrn = ['3B', '2B', '1B']
        n_outs = [2, 1, 0]
        n_add_bsrn = {'3B': [2, 1, 0], '2B': [1, 0], '1B': [0]}
        bsox = dict()
        for lead in ld_bsrn:
            bsox[lead] = dict()
            for out in n_outs:
                bsox[lead][out] = dict()
                for add_bsrn in n_add_bsrn[lead]:
                    bsox[lead][out][add_bsrn] = None

        # Markov Chaining -> bsox[lead][outs][add_bsrn]
        # Short defs
        fq1B = fqrts['fqs']['1B']
        fq2B = fqrts['fqs']['2B']
        fqBB = fqrts['fqs']['BB']
        fqOUT = fqrts['fqs']['OUT']
        rtBBO = fqrts['rts']['BBO']

        # 3B - 2 outs
        bsox['3B'][2][2] = fqOUT
        bsox['3B'][2][1] = bsox['3B'][2][2] * fqBB + fqOUT
        bsox['3B'][2][0] = bsox['3B'][2][1] * fqBB + fqOUT
        # 3B - 1 out
        bsox['3B'][1][2] = bsox['3B'][2][2] * fqOUT * (1 - rtBBO * xb['OUT']['3B'][1])
        bsox['3B'][1][1] = bsox['3B'][1][2] * fqBB + bsox['3B'][2][1] * fqOUT * (1 - rtBBO * xb['OUT']['3B'][1])
        bsox['3B'][1][0] = bsox['3B'][1][1] * fqBB + bsox['3B'][2][0] * fqOUT * (1 - rtBBO * xb['OUT']['3B'][1])
        # 3B - 0 outs
        bsox['3B'][0][2] = bsox['3B'][1][2] * fqOUT * (1 - rtBBO * xb['OUT']['3B'][0])
        bsox['3B'][0][1] = bsox['3B'][0][2] * fqBB + bsox['3B'][1][1] * fqOUT * (1 - rtBBO * xb['OUT']['3B'][0])
        bsox['3B'][0][0] = bsox['3B'][0][1] * fqBB + bsox['3B'][1][0] * fqOUT * (1 - rtBBO * xb['OUT']['3B'][0])
        # 2B - 2 outs
        bsox['2B'][2][1] = bsox['3B'][2][2] * (fqBB + fq1B * (1 - xb['1B']['2B'][2])) + fqOUT
        bsox['2B'][2][0] = bsox['2B'][2][1] * fqBB + bsox['3B'][2][1] * fq1B * (1 - xb['1B']['2B'][2]) + fqOUT
        # 2B - 1 out
        bsox['2B'][1][1] = (
            bsox['3B'][1][2] * (fqBB + fq1B * (1 - xb['1B']['2B'][1])) +
            bsox['3B'][2][1] * fqOUT * rtBBO * xb['OUT']['2B'][1] +
            bsox['2B'][2][1] * fqOUT * (1 - rtBBO * xb['OUT']['2B'][1])
        )
        bsox['2B'][1][0] = (
            bsox['2B'][1][1] * fqBB +
            bsox['3B'][1][1] * fq1B * (1 - xb['1B']['2B'][1]) +
            bsox['3B'][2][0] * fqOUT * rtBBO * xb['OUT']['2B'][1] +
            bsox['2B'][2][0] * fqOUT * (1 - rtBBO * xb['OUT']['2B'][1])
        )
        # 2B - 0 outs
        bsox['2B'][0][1] = (
            bsox['3B'][0][2] * (fqBB + fq1B * (1 - xb['1B']['2B'][0])) +
            bsox['3B'][1][1] * fqOUT * rtBBO * xb['OUT']['2B'][0] +
            bsox['2B'][1][1] * fqOUT * (1 - rtBBO * xb['OUT']['2B'][0])
        )
        bsox['2B'][0][0] = (
            bsox['2B'][0][1] * fqBB +
            bsox['3B'][0][1] * fq1B * (1 - xb['1B']['2B'][0]) +
            bsox['3B'][1][0] * fqOUT * rtBBO * xb['OUT']['2B'][0] +
            bsox['2B'][1][0] * fqOUT * (1 - rtBBO * xb['OUT']['2B'][0])
        )
        # 1B - 2 outs
        bsox['1B'][2][0] = (
            bsox['2B'][2][1] * (fqBB + fq1B * (1 - xb['1B']['1B'][2])) +
            bsox['3B'][2][1] * (fq1B * (xb['1B']['1B'][2]) + fq2B * (1 - xb['2B']['1B'][2])) +
            fqOUT
        )
        # 1B - 1 out
        bsox['1B'][1][0] = (
            bsox['2B'][1][1] * (fqBB + fq1B * (1 - xb['1B']['1B'][1])) +
            bsox['3B'][1][1] * (fq1B * (xb['1B']['1B'][1]) + fq2B * (1 - xb['2B']['1B'][1])) +
            bsox['2B'][2][0] * fqOUT * rtBBO * xb['OUT']['1B'][1] +
            bsox['1B'][2][0] * fqOUT * (1 - rtBBO * xb['OUT']['1B'][1])
        )
        # 1B - 0 outs
        bsox['1B'][0][0] = (
            bsox['2B'][0][1] * (fqBB + fq1B * (1 - xb['1B']['1B'][0])) +
            bsox['3B'][0][1] * (fq1B * (xb['1B']['1B'][0]) + fq2B * (1 - xb['2B']['1B'][0])) +
            bsox['2B'][1][0] * fqOUT * rtBBO * xb['OUT']['1B'][0] +
            bsox['1B'][1][0] * fqOUT * (1 - rtBBO * xb['OUT']['1B'][0])
        )
        return bsox

    def chance_rho(self):

        # Chance of scoring
        bsox = self.re_engine()
        chrun = {'3B': dict(), '2B': dict(), '1B': dict()}

        # 0 outs (3 remain)
        chrun['3B'][3] = 1 - (bsox['3B'][2][0] + bsox['3B'][1][0] + bsox['3B'][0][0]) / 3.0
        chrun['2B'][3] = 1 - (bsox['2B'][2][0] + bsox['2B'][1][0] + bsox['2B'][0][0]) / 3.0
        chrun['1B'][3] = 1 - (bsox['1B'][2][0] + bsox['1B'][1][0] + bsox['1B'][0][0]) / 3.0
        # 1 out (2 remain)
        chrun['3B'][2] = 1 - (bsox['3B'][2][0] + bsox['3B'][1][0]) / 3.0
        chrun['2B'][2] = 1 - (bsox['2B'][2][0] + bsox['2B'][1][0]) / 3.0
        chrun['1B'][2] = 1 - (bsox['1B'][2][0] + bsox['1B'][1][0]) / 3.0
        # 2 outs (1 remains)
        chrun['3B'][1] = 1 - (bsox['3B'][2][0]) / 3.0
        chrun['2B'][1] = 1 - (bsox['2B'][2][0]) / 3.0
        chrun['1B'][1] = 1 - (bsox['1B'][2][0]) / 3.0
        return chrun

    def mk_rexmat(self):

        # Prereqs
        fqrts = self.calc_frqs()
        bsox = self.re_engine()
        chrun = self.chance_rho()

        # Defs
        RexMat = []

        # Times a runner scores from an outcome
        rHR = fqrts['fqs']['HR']
        r3B_3 = chrun['3B'][3] * fqrts['fqs']['3B']
        r2B_3 = chrun['2B'][3] * fqrts['fqs']['2B']
        r1B_3 = chrun['1B'][3] * (fqrts['fqs']['1B'] + fqrts['fqs']['BB'])
        r3B_2 = chrun['3B'][2] * fqrts['fqs']['3B']
        r2B_2 = chrun['2B'][2] * fqrts['fqs']['2B']
        r1B_2 = chrun['1B'][2] * (fqrts['fqs']['1B'] + fqrts['fqs']['BB'])
        r3B_1 = chrun['3B'][1] * fqrts['fqs']['3B']
        r2B_1 = chrun['2B'][1] * fqrts['fqs']['2B']
        r1B_1 = chrun['1B'][1] * (fqrts['fqs']['1B'] + fqrts['fqs']['BB'])

        # Runs/Game
        rALL = (rHR + r3B_3 + r2B_3 + r1B_3) * fqrts['fqs']['PA']
        rpi_3 = (rHR + r3B_3 + r2B_3 + r1B_3) * fqrts['fqs']['PA'] / 9.0
        rpi_2 = (rHR + r3B_2 + r2B_2 + r1B_2) * fqrts['fqs']['PA'] * 2.0 / 3.0 / 9.0
        rpi_1 = (rHR + r3B_1 + r2B_1 + r1B_1) * fqrts['fqs']['PA'] * 1.0 / 3.0 / 9.0
        RE_1xx_0 = (1 - bsox['1B'][0][0]) + rpi_3
        RE_1xx_1 = (1 - bsox['1B'][1][0]) + rpi_2
        RE_1xx_2 = (1 - bsox['1B'][2][0]) + rpi_1

        return rALL



if __name__ == '__main__':
    rec = RunExpCalc()
    pprint(rec.calc_frqs())
    pprint(rec.re_engine())
    pprint(rec.chance_rho())
    pprint(rec.mk_rexmat())
