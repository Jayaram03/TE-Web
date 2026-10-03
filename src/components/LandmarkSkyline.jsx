import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Plane } from 'lucide-react';

// Original scalable line artwork, repeated as a single panoramic track.
const SkylineDrawing = () => (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 212H2028" opacity="0.25" />

        {/* London: Elizabeth Tower */}
        <g transform="translate(24 0)">
            <path d="M30 212V112H90V212M24 112H96L84 100V80H36V100ZM42 80V64H78V80M46 64L60 38L74 64M60 38V24" />
            <circle cx="60" cy="133" r="14" />
            <path d="M60 123V133L68 138M43 161H77M43 178H77M43 195H77M48 112V100M72 112V100" opacity="0.6" />
        </g>

        {/* Paris: Eiffel Tower */}
        <g transform="translate(160 0)">
            <path d="M12 212Q50 147 60 67H70Q80 147 118 212H91Q65 155 39 212ZM65 67V34M57 67H73M40 143H90M33 164H97M19 198H111" />
            <path d="M51 103L81 143M79 103L49 143M42 164L90 198M88 164L40 198" opacity="0.5" />
        </g>

        {/* Agra: Taj Mahal */}
        <g transform="translate(306 0)">
            <path d="M28 212V155H116V212M43 155Q34 134 53 120Q70 110 72 99Q74 110 91 120Q110 134 101 155M72 99V89M59 212V188Q72 168 85 188V212M34 170H46V193H34ZM98 170H110V193H98Z" />
            <path d="M7 212V144H17V212M127 212V144H137V212M5 144L12 132L19 144M125 144L132 132L139 144M7 167H17M127 167H137M7 189H17M127 189H137" />
        </g>

        {/* Dubai: Burj Khalifa */}
        <g transform="translate(474 0)">
            <path d="M20 212V175H34V129H46V84H55V51H61V24H65V51H71V84H80V129H92V175H106V212M63 24V7" />
            <path d="M55 84V212M71 84V212M46 129H80M34 175H92M34 188H92M34 201H92M55 102H71M55 116H71M46 146H80M46 160H80" opacity="0.5" />
        </g>

        {/* Rome: Colosseum */}
        <g transform="translate(614 0)">
            <path d="M10 212V145Q69 121 130 145V212M10 163Q69 141 130 163M10 188Q69 169 130 188M10 204Q69 186 130 204" />
            {[22, 44, 66, 88, 110].map((x) => (
                <path key={x} d={`M${x} 178V163Q${x + 5} 153 ${x + 10} 163V178M${x} 201V190Q${x + 5} 180 ${x + 10} 190V201`} opacity="0.7" />
            ))}
        </g>

        {/* New York: Statue of Liberty */}
        <g transform="translate(770 0)">
            <path d="M30 212V195H98V212M40 195V182H88V195M47 182L53 129L43 107L32 78L24 56L34 50L47 77L62 93H76L86 112L101 122L93 143L80 135L84 182ZM58 93V78Q68 66 78 78V93M58 78L51 67M62 73L59 60M69 71V57M76 74L82 62M80 80L91 74M24 56L22 43H35L34 50M25 43Q19 34 29 26Q40 36 32 43M91 124L102 129L96 141" />
            <path d="M61 114L55 176M72 116L76 175M45 202H83" opacity="0.5" />
        </g>

        {/* Sydney: Opera House */}
        <g transform="translate(909 0)">
            <path d="M6 212H139L132 197H17ZM17 197Q13 167 8 148Q41 157 59 197M44 197Q40 154 31 123Q78 143 94 197M75 197Q83 165 83 140Q111 163 119 197M100 197Q119 180 131 170L130 197" />
            <path d="M31 123L59 197M83 140L94 197M8 148L32 197M17 205H132" opacity="0.5" />
        </g>

        {/* Giza: pyramids */}
        <g transform="translate(1066 0)">
            <path d="M0 212L60 129L120 212ZM60 129L76 212M0 212L28 165L44 188M85 163L111 144L132 212" />
            <path d="M60 129L14 212M111 144L119 212" opacity="0.4" />
        </g>

        {/* A quiet flight trail ties the panorama together. */}
        <path d="M108 64Q182 10 282 57T455 54M701 63Q802 20 887 65T1097 61" strokeDasharray="3 8" opacity="0.3" />

        {/* Pisa: leaning bell tower */}
        <g transform="translate(1220 0) rotate(-9 50 212)">
            <path d="M20 212V80Q50 66 80 80V212M15 212H85M20 98Q50 84 80 98M20 121Q50 107 80 121M20 144Q50 130 80 144M20 167Q50 153 80 167M20 190Q50 176 80 190M28 77V59H72V77" />
            <path d="M32 98V87M50 94V83M68 98V87M32 121V110M50 117V106M68 121V110M32 144V133M50 140V129M68 144V133M32 167V156M50 163V152M68 167V156M32 190V179M50 186V175M68 190V179" opacity="0.6" />
        </g>

        {/* Kuala Lumpur: Petronas Towers */}
        <g transform="translate(1350 0)">
            <path d="M10 212V116H46V212M74 212V116H110V212M15 116V86H41V116M79 116V86H105V116M20 86V63H36V86M84 86V63H100V86M28 63V38M92 63V38M46 143H74V158H46M10 136H46M74 136H110M10 174H46M74 174H110M10 193H46M74 193H110" />
        </g>

        {/* Kyoto: five-storey pagoda */}
        <g transform="translate(1500 0)">
            <path d="M20 212V186H100V212M15 186Q32 181 39 165H81Q88 181 105 186ZM25 156Q40 151 45 137H75Q80 151 95 156ZM32 128Q44 123 49 110H71Q76 123 88 128ZM40 100Q51 96 53 83H67Q69 96 80 100ZM47 73L60 58L73 73M60 58V37M35 186V156M85 186V156M42 137V128M78 137V128M50 110V100M70 110V100M49 212V197H71V212" />
        </g>

        {/* Singapore: Marina Bay Sands */}
        <g transform="translate(1650 0)">
            <path d="M10 110Q67 93 127 108L118 124H19ZM23 124L17 212H42L46 124M60 124L56 212H81L83 124M97 124L94 212H118L118 124M12 212H126" />
            <path d="M24 146H43M22 169H42M20 191H41M60 146H81M59 169H80M57 191H79M98 146H118M97 169H118M96 191H118" opacity="0.5" />
        </g>

        {/* Barcelona: Sagrada Família */}
        <g transform="translate(1800 0)">
            <path d="M5 212V156H115V212M15 156L19 86L27 68L35 86L39 156M45 156L49 61L57 43L65 61L69 156M75 156L79 73L87 55L95 73L99 156M27 68V55M57 43V30M87 55V42M45 212V190Q60 169 75 190V212M15 170H105M20 184H32V202H20M90 184H102V202H90" />
        </g>

        {/* Paris: Arc de Triomphe */}
        <g transform="translate(1940 0)">
            <path d="M6 212V135H84V212M0 135H90V122H0ZM28 212V176Q45 151 62 176V212M15 144H75M15 155H25M65 155H75M15 185H22M68 185H75M0 212H90" />
        </g>
    </g>
);

const LandmarkSkyline = () => {
    const ref = useRef(null);
    const visible = useInView(ref);

    return (
        <div ref={ref} aria-hidden="true" className={`skyline-scene ${visible ? 'is-active' : ''}`}>
            <div className="skyline-flight">
                <Plane className="h-5 w-5 rotate-45 text-orange-200" />
            </div>
            <div className="skyline-track">
                {[0, 1].map(copy => (
                    <svg key={copy} viewBox="0 0 2040 224" className="skyline-panel" focusable="false">
                        <SkylineDrawing />
                    </svg>
                ))}
            </div>
        </div>
    );
};

export default LandmarkSkyline;