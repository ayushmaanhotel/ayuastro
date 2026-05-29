import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:pdfx/pdfx.dart';
import '../widgets/custom_widgets.dart';

class PdfViewerScreen extends StatefulWidget {
  final String filePath;

  const PdfViewerScreen({Key? key, required this.filePath}) : super(key: key);

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  late PdfController _pdfController;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    try {
      _pdfController = PdfController(
        document: PdfDocument.openFile(widget.filePath),
      );
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  void dispose() {
    try {
      _pdfController.dispose();
    } catch (_) {}
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            LucideIcons.arrow_left,
            color: isDark ? Colors.white : AppColors.brown900,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Personality Report PDF",
          style: TextStyle(
            color: isDark ? Colors.white : AppColors.brown900,
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: StarFieldBackground(
        child: _isLoading
            ? const Center(
                child: CosmicLoader(message: "Mapping celestial pages..."),
              )
            : _errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                          const SizedBox(height: 16),
                          Text(
                            "Unable to open cosmic document",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.brown900,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _errorMessage!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: AppColors.brown500, fontSize: 13),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: () => Navigator.pop(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.gold,
                            ),
                            child: const Text("Go Back", style: TextStyle(color: Colors.white)),
                          ),
                        ],
                      ),
                    ),
                  )
                : Stack(
                    children: [
                      // PDF Reader main view
                      Padding(
                        padding: const EdgeInsets.only(bottom: 72),
                        child: PdfView(
                          controller: _pdfController,
                          scrollDirection: Axis.vertical,
                          physics: const BouncingScrollPhysics(),
                          builders: PdfViewBuilders<DefaultBuilderOptions>(
                            options: const DefaultBuilderOptions(),
                            documentLoaderBuilder: (_) => const Center(
                              child: CosmicLoader(message: "Aligning stars..."),
                            ),
                            pageLoaderBuilder: (_) => const Center(
                              child: CircularProgressIndicator(color: AppColors.gold),
                            ),
                          ),
                        ),
                      ),

                      // Floating Bottom Navigation Controller Bar
                      Positioned(
                        left: 20,
                        right: 20,
                        bottom: 20,
                        child: ValueListenableBuilder<int>(
                          valueListenable: _pdfController.pageListenable,
                          builder: (context, currentPage, _) {
                            final totalPages = _pdfController.pagesCount ?? 0;
                            return GlassPremiumCard(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  IconButton(
                                    icon: Icon(
                                      LucideIcons.chevron_left,
                                      color: currentPage > 1
                                          ? AppColors.gold
                                          : (isDark ? Colors.white24 : AppColors.brown400),
                                    ),
                                    onPressed: currentPage > 1
                                        ? () => _pdfController.previousPage(
                                              duration: const Duration(milliseconds: 300),
                                              curve: Curves.easeInOut,
                                            )
                                        : null,
                                  ),
                                  Text(
                                    "Segment Page $currentPage of $totalPages",
                                    style: TextStyle(
                                      color: isDark ? Colors.white : AppColors.brown900,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  IconButton(
                                    icon: Icon(
                                      LucideIcons.chevron_right,
                                      color: currentPage < totalPages
                                          ? AppColors.gold
                                          : (isDark ? Colors.white24 : AppColors.brown400),
                                    ),
                                    onPressed: currentPage < totalPages
                                        ? () => _pdfController.nextPage(
                                              duration: const Duration(milliseconds: 300),
                                              curve: Curves.easeInOut,
                                            )
                                        : null,
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }
}
