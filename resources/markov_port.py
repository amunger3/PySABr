from collections import Counter


_bline_def = Counter(
    {
        'AB': 37,
        'H': 10,
        '2B': 2,
        '3B': 0,
        'HR': 1,
        'BB': 4,
        'SO': 7
    }
)

# Calculated Run Expectancies given a batting line
class RunExpCalc:

    def __init__(self):
        self.bl = _bline_def
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
            'rtBBO': 1 - fq['SO'] / fq['OUT'],
            'rtSLG': sum(list(map(lambda x, y: x * y, [1, 2, 3, 4], [fq['1B'], fq['2B'], fq['3B'], fq['HR']]))) / (1 - fq['BB']),
            'rtAVG': sum([fq['1B'], fq['2B'], fq['3B'], fq['HR']]) / (1 - fq['BB'])
        }
        return {'fqs': fq, 'rts': rt}

    def re_engine(self):

        # Chance of not scoring from each BaseOut state
        fqrts = self.calc_frqs()

        # Construct XScoreProb Matrix as a dictionary
        ld_bsrn = ['3B', '2B', '1B']
        n_add_bsrn = {'3B': [2, 1, 0], '2B': [1, 0], '1B': [0]}
        n_outs = [2, 1, 0]
        bsox = dict()
        for lead in ld_bsrn:
            bsox[lead] = dict()
            for add_bsrn in n_add_bsrn[lead]:
                bsox[lead][add_bsrn] = dict()
                for out in n_outs:
                    bsox[lead][add_bsrn][out] = None

        # Calc from freqs
        bsox['3B'][2][2] = fqrts['fqs']['OUT']
        bsox['3B'][2][1] = bsox['3B'][2][2] * fqrts['fqs']['BB'] + fqrts['fqs']['OUT']
        bsox['3B'][2][0] = bsox['3B'][2][1] * fqrts['fqs']['BB'] + fqrts['fqs']['OUT']

        return bsox


if __name__ == '__main__':
    rec = RunExpCalc()
    print(rec.re_engine())